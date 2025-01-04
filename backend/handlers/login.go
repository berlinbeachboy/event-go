package handlers

import (
	"net/http"
	"time"

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

func Register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ur UserRegister
		if err := c.ShouldBindJSON(&ur); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if ur.SitePassword != util.SitePW() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Falsches Passwort (frag nochmal einen Admin)"})
			return
		}
		var userExist models.User
		if err := db.First(&userExist, "username = ?", &ur.Username).Error; err == nil {
			// If the user exists but does not have a password, an admin might have created it
			// it will then be filled by an actual user
			if userExist.Password == nil {
				userExist.Nickname = ur.Nickname
				userExist.FullName = &ur.FullName
				userExist.Phone = &ur.Phone
				UpdatePassword(&userExist, ur.Password)
				db.Save(&userExist)
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists, please login"})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(ur.Password), bcrypt.DefaultCost)
		hpstring := string(hashedPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user := models.User{
			Username: &ur.Username,
			Password: &hpstring,
			Type:     "reg",
			Nickname: ur.Nickname,
			FullName: &ur.FullName,
		}
		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}
		c.IndentedJSON(http.StatusCreated, user)
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
		if err := db.Where("username = ?", &creds.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(creds.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		tokenString, err := util.MakeJWT(creds.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		now := time.Now()
		user.LastLogin = &now
		db.Save(&user)
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("jwt", tokenString, 3600, "/", "localhost", false, true)
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	}
}

func Logout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("jwt", "", -1, "/", "localhost", false, true)
		c.JSON(http.StatusOK, "ok")
	}
}
