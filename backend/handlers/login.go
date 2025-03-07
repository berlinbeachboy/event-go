package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"sfpr/models"
	"sfpr/util"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Credentials struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserRegister struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Nickname string `json:"nickname" binding:"required"`
	FullName string `json:"fullName" binding:"required"`
	Phone    string `json:"phone"`

	SitePassword string `json:"sitePassword"`
}

type ResetPWStruct struct {
	Token           string `json:"token" binding:"required"`
	Password        string `json:"password" binding:"required"`
	PasswordConfirm string `json:"passwordConfirm" binding:"required"`
}

func CheckPasswords(password, passwordConfirm string) error {
	if password != passwordConfirm {
		return errors.New("passwords don't match")
	}
	if utf8.RuneCountInString(password) < 6 {
		return errors.New("password needs to be at least 6 characters")
	}
	return nil
}

// generateVerificationToken creates a random token
func generateVerificationToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func Register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ur UserRegister
		if err := c.ShouldBindJSON(&ur); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Falsches Datenformat bzw. fehlende Infos."})
			return
		}

		if ur.SitePassword != util.SitePW() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Falsches Seiten Passwort (frag nochmal einen Admin)"})
			return
		}
		var userExist models.User
		usernameLower := strings.ToLower(ur.Username)
		if err := db.First(&userExist, "username = ?", &usernameLower).Error; err == nil {
			// If the user exists but is not activated, an admin might have created it
			// it will then be filled by an actual user
			if userExist.IsActivated {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Es gibt bereits einen User mit dieser Email. Notfalls Passwort zurücksetzen?"})
				return
			}
			userExist.Nickname = ur.Nickname
			userExist.FullName = &ur.FullName
			userExist.Phone = &ur.Phone
			UpdatePassword(&userExist, ur.Password)

			// Generate verification token
			token, err := generateVerificationToken()
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to generate verification token"})
				return
			}
			expiryTime := time.Now().Add(24 * time.Hour)
			// Set token and expiry time
			userExist.VerificationToken = &token
			userExist.TokenExpiryTime = &expiryTime

			db.Save(&userExist)

			// Send verification email
			verificationLink := fmt.Sprintf("%s/api/verify?token=%s", util.ApiBaseURL(), token)
			if !util.EmailsEnabled {
				fmt.Println("Cannot send Email to ", *userExist.Username)
				fmt.Println("Their verification Link is: ", verificationLink)
				c.IndentedJSON(http.StatusCreated, userExist.ToResponse())
				return
			}

			if err := util.SendVerificationEmail(*userExist.Username, verificationLink, userExist.Nickname); err != nil {
				fmt.Println("Failed to send Verification Email to ", *userExist.Username)
				fmt.Println("Error was ", err.Error())
				fmt.Println("Their verification Link is: ", verificationLink)
				c.JSON(500, gin.H{"error": "Failed to send verification email"})
				return
			}
			c.IndentedJSON(http.StatusCreated, userExist.ToResponse())
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(ur.Password), bcrypt.DefaultCost)
		hpstring := string(hashedPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user := models.User{
			Username: &usernameLower,
			Password: &hpstring,
			Type:     "reg",
			Nickname: ur.Nickname,
			FullName: &ur.FullName,
		}
		// Generate verification token
		token, err := generateVerificationToken()
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate verification token"})
			return
		}
		expiryTime := time.Now().Add(24 * time.Hour)
		// Set token and expiry time
		user.VerificationToken = &token
		user.TokenExpiryTime = &expiryTime

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}

		verificationLink := fmt.Sprintf("%s/api/verify?token=%s", util.ApiBaseURL(), token)
		// Send verification email
		if !util.EmailsEnabled {
			fmt.Println("Cannot send Email to ", *user.Username)
			fmt.Println("Their verification Link is: ", verificationLink)
			c.IndentedJSON(http.StatusCreated, user.ToResponse())
			return
		}

		if err := util.SendVerificationEmail(*user.Username, verificationLink, user.Nickname); err != nil {
			fmt.Println("Failed to send Verification Email to ", *user.Username)
			fmt.Println("Error was ", err.Error())
			fmt.Println("Their verification Link is: ", verificationLink)
			c.JSON(500, gin.H{"error": "Failed to send verification email"})
			return
		}

		c.IndentedJSON(http.StatusCreated, user.ToResponse())
	}
}

func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var creds Credentials
		if err := c.ShouldBindJSON(&creds); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		var user models.User
		usernameLower := strings.ToLower(creds.Username)
		if err := db.Where("username = ?", &usernameLower).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(creds.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		if !user.IsActivated {
			c.JSON(http.StatusForbidden, gin.H{"error": "User not nicht verifiziert. Bitte den Email Link benutzen."})
			return
		}

		tokenString, err := util.MakeJWT(usernameLower)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		now := time.Now()
		user.LastLogin = &now
		db.Save(&user)
		c.SetSameSite(http.SameSiteLaxMode)
		var site string
		var secureCookie bool
		if util.EnvIsProd() {
			site = "schoenfeld.fun"
			secureCookie = true
		} else {
			site = "localhost"
			secureCookie = false
		}
		c.SetCookie("jwt", tokenString, 3600, "/api", site, secureCookie, true)
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	}
}

func Verify(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.JSON(400, gin.H{"error": "Invalid verification token"})
			return
		}

		// Find user by token (implement your database logic here)
		var user models.User
		result := db.Where("verification_token = ?", token).First(&user)
		if result.Error != nil {
			c.JSON(404, gin.H{"error": "Invalid verification token"})
			return
		}

		// Check token expiry
		if time.Now().After(*user.TokenExpiryTime) {
			c.JSON(400, gin.H{"error": "Verification token has expired"})
			return
		}

		// Activate user
		user.IsActivated = true
		user.VerificationToken = util.StrPtr("")
		db.Save(&user)

		// c.JSON(200, gin.H{"message": "Email verified successfully"})
		c.Redirect(307, util.FrontendBaseURL()+"/home?verify=success")
	}
}

func Logout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		c.SetSameSite(http.SameSiteLaxMode)
		var site string
		var secureCookie bool
		if util.EnvIsProd() {
			site = "schoenfeld.fun"
			secureCookie = true
		} else {
			site = "localhost"
			secureCookie = false
		}
		c.SetCookie("jwt", "", -1, "/api", site, secureCookie, true)
		c.JSON(http.StatusOK, "ok")
	}
}

// Request a link to reset password in email
func RequestPWReset(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			c.JSON(400, gin.H{"error": "No username/email set."})
			return
		}
		var userExist models.User
		usernameLower := strings.ToLower(username)
		if err := db.First(&userExist, "username = ?", usernameLower).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
			c.Abort()
			return
		}

		// Generate verification token
		token, err := generateVerificationToken()
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to generate verification token"})
			return
		}
		expiryTime := time.Now().Add(24 * time.Hour)
		// Set token and expiry time
		userExist.VerificationToken = &token
		userExist.TokenExpiryTime = &expiryTime
		db.Save(&userExist)

		verificationLink := fmt.Sprintf("%s/home?resetToken=%s", util.FrontendBaseURL(), token)
		// Send pw reset email
		if util.EmailsEnabled {
			if err := util.SendPWResetEmail(*userExist.Username, verificationLink, userExist.Nickname); err != nil {
				c.JSON(500, gin.H{"error": "Failed to send verification email"})
				return
			}
		} else {
			fmt.Printf("Cannot send PW Reset Email to %s", *userExist.Username)
			fmt.Printf("Their PW Reset Link is:  %s", verificationLink)
		}

		c.JSON(http.StatusOK, "Ok")

	}
}

func ResetPW(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		var pwu ResetPWStruct
		if err := c.ShouldBindJSON(&pwu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		// Find user by token
		var userExist models.User
		result := db.Where("verification_token = ?", pwu.Token).First(&userExist)
		if result.Error != nil {
			c.JSON(404, gin.H{"error": "Invalid verification token"})
			return
		}

		if err := CheckPasswords(pwu.Password, pwu.PasswordConfirm); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		UpdatePassword(&userExist, pwu.Password)

		db.Save(&userExist)
		c.JSON(http.StatusOK, "Ok")
	}
}
