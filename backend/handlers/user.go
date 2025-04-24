package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"sfpr/models"
	"sfpr/util"
)

type UserUpdate struct {
	Username    *string  `json:"username"`
	Nickname    *string  `json:"nickname"`
	FullName    *string  `json:"fullName"`
	Phone       *string  `json:"phone"`
	Type        *string  `json:"type"`
	AmountPaid  *float32 `json:"amountPaid"`
	SoliAmount  *float32 `json:"soliAmount"`
	TakesSoli   *bool    `json:"takesSoli"`
	DonatesSoli *bool    `json:"donatesSoli"`
	SundayShift *string  `json:"sundayShift"`
	SpotTypeID  *uint    `json:"spotTypeId"`
}

type UserCreate struct {
	Username   *string `json:"username"`
	Nickname   string  `json:"nickname"`
	FullName   *string `json:"fullName"`
	Phone      *string `json:"phone"`
	SpotTypeID *uint   `json:"spotTypeId,omitempty"`
}

type PWUpdate struct {
	Password        string `json:"password" binding:"required"`
	PasswordConfirm string `json:"passwordConfirm" binding:"required"`
}

func updateUser(ue *models.User, uu UserUpdate) {
	if uu.Username != nil {
		ue.Username = uu.Username
	}
	if uu.FullName != nil {
		ue.FullName = uu.FullName
	}
	if uu.Nickname != nil {
		ue.Nickname = *uu.Nickname
	}
	if uu.Phone != nil {
		ue.Phone = uu.Phone
	}
	if uu.Type != nil {
		ue.Type = *uu.Type
	}
	if uu.Type != nil {
		ue.Type = *uu.Type
	}
	if uu.AmountPaid != nil {
		ue.AmountPaid = *uu.AmountPaid
	}
	if uu.SoliAmount != nil {
		ue.SoliAmount = *uu.SoliAmount
	}
	if uu.TakesSoli != nil {
		ue.TakesSoli = *uu.TakesSoli
	}
	if uu.DonatesSoli != nil {
		ue.DonatesSoli = *uu.DonatesSoli
	}
	if uu.SundayShift != nil {
		ue.SundayShift = uu.SundayShift
	}
	if uu.SpotTypeID != nil && int(*uu.SpotTypeID) == 0 {
		ue.SpotTypeID = nil
	} else if uu.SpotTypeID != nil {
		ue.SpotTypeID = uu.SpotTypeID
	}

}

func checkSpot(db *gorm.DB, spotTypeId int, checkLimit bool) error {
	if spotTypeId == 0 {
		return nil
	}
	spot, err := GetSpotById(db, strconv.Itoa(spotTypeId))
	if err != nil {
		fmt.Println("Got Spottype Id ", strconv.Itoa(spotTypeId), "which could not be found")
		return errors.New("bad Spottype")
	}
	if checkLimit && spot.CurrentCount >= spot.Limit {
		fmt.Println("Got Spottype Id ", strconv.Itoa(spotTypeId), "which is full")
		return errors.New("leider schon voll")
	}
	return nil
}

func UpdatePassword(ue *models.User, pw string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	hpstring := string(hashedPassword)
	ue.Password = &hpstring
	return nil
}

func GetMe(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
			return
		}
		var userExist models.User
		if err := db.Preload("SpotType").First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
			return
		}

		c.JSON(http.StatusOK, userExist.ToResponse())
	}
}

func PutMe(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var userExist models.User
		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var uu UserUpdate
		if err := c.ShouldBindJSON(&uu); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		zero := uint(0)
		// check SpotType
		if uu.SpotTypeID != nil && uu.SpotTypeID != &zero {

			// only check the limit if the spot Type is different or new
			checkLimit := userExist.SpotTypeID == nil || *uu.SpotTypeID != *userExist.SpotTypeID
			if err := checkSpot(db, int(*uu.SpotTypeID), checkLimit); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Bad Spottype."})
				return
			}
		}

		// cannot set this through this endpoint
		uu.Type = nil
		uu.Username = nil
		uu.AmountPaid = nil
		if uu.SoliAmount != nil && uu.TakesSoli != nil && *uu.SoliAmount > 0 && *uu.TakesSoli {
			fmt.Println("Du kannst den Soli nicht gleichzeitig geben und nehmen")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Du kannst den Soli nicht gleichzeitig geben und nehmen."})
			return
		}

		updateUser(&userExist, uu)
		db.Session(&gorm.Session{FullSaveAssociations: true}).Save(&userExist)

		// full reload so that all fields are there for output
		if err := db.Model(&userExist).Association("SpotType").Find(&userExist.SpotType); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "Konnte den SpotType nach Update nicht laden."})
			return
		}
		c.JSON(http.StatusOK, userExist.ToResponse())
	}
}

func PutMePW(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, _ := c.Get("username")
		var userExist models.User
		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var pwu PWUpdate
		if err := c.ShouldBindJSON(&pwu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		if err := CheckPasswords(pwu.Password, pwu.PasswordConfirm); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		UpdatePassword(&userExist, pwu.Password)

		db.Save(&userExist)
		c.JSON(http.StatusOK, userExist.ToResponse())

	}
}

func GetUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var users []models.User
		if err := db.Preload("SpotType").Order("last_login desc").Find(&users).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bad DB query"})
			return
		}
		c.IndentedJSON(http.StatusOK, models.ToUsersResponseList(users))
	}
}

func CreateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var uc UserCreate
		if err := c.ShouldBindJSON(&uc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		user := models.User{
			Username: uc.Username,
			Password: nil,
			Type:     "reg",
			Nickname: uc.Nickname,
			FullName: uc.FullName,
		}
		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}
		c.IndentedJSON(http.StatusCreated, user.ToResponse())
	}
}

func PutUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
			return
		}
		uid := c.Param("id")
		var userExist models.User
		if err := db.Preload("SpotType").First(&userExist, "ID = ?", uid).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var uu UserUpdate
		if err := c.ShouldBindJSON(&uu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		// check SpotType
		if uu.SpotTypeID != nil && *uu.SpotTypeID != *userExist.SpotTypeID {
			// only check the limit if the spot Type is different or new
			checkLimit := userExist.SpotTypeID == nil || *uu.SpotTypeID != *userExist.SpotTypeID
			if err := checkSpot(db, int(*uu.SpotTypeID), checkLimit); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Bad Spottype."})
				return
			}
		}
		if uu.SoliAmount != nil && uu.TakesSoli != nil && *uu.SoliAmount >= 0 && *uu.TakesSoli {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Du kannst nicht Soli geben und nehmen gleichzeitig."})
			return
		}
		updateUser(&userExist, uu)
		db.Session(&gorm.Session{FullSaveAssociations: true}).Save(&userExist)

		// Need to reload the Association after changing the Foreign Key
		if uu.SpotTypeID != nil {
			if err := db.Model(&userExist).Association("SpotType").Find(&userExist.SpotType); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Konnte den SpotType nach Update nicht laden."})
				return
			}
		}
		db.Save(&userExist)
		c.JSON(http.StatusOK, userExist.ToResponse())

	}
}

func PutUserPW(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
			return
		}
		uid := c.Param("id")
		var userExist models.User
		if err := db.Preload("SpotType").First(&userExist, "ID = ?", uid).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var pwu PWUpdate
		if err := c.ShouldBindJSON(&pwu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		if err := CheckPasswords(pwu.Password, pwu.PasswordConfirm); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		UpdatePassword(&userExist, pwu.Password)

		db.Save(&userExist)
		c.JSON(http.StatusOK, userExist.ToResponse())
	}
}

func DeleteUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Failed to retrieve user."})
			return
		}
		uid := c.Param("id")
		var userExist models.User
		if err := db.Preload("SpotType").First(&userExist, "ID = ?", uid).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		if userExist.Username == util.StrPtr("p@p.com") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete Super Admin User."})
			return
		}
		db.Delete(&userExist)
		c.JSON(http.StatusOK, userExist.ToResponse())
	}
}
