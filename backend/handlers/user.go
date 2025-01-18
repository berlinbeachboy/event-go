package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"sfpr/models"
)

type UserUpdate struct {
	Username   *string  `json:"username"`
	Nickname   *string  `json:"nickname"`
	FullName   *string  `json:"fullName"`
	Phone      *string  `json:"phone"`
	Type       *string  `json:"type"` // can only be
	AmountPaid *float32 `json:"amountPaid"`
	GivesSoli  *bool    `json:"givesSoli"`
	TakesSoli  *bool    `json:"takesSoli"`
	SpotTypeID *uint    `json:"spotTypeId,omitempty"`
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
	if uu.GivesSoli != nil {
		ue.GivesSoli = *uu.GivesSoli
	}
	if uu.TakesSoli != nil {
		ue.TakesSoli = *uu.TakesSoli
	}
	zero := uint(0)
	if uu.SpotTypeID != nil && uu.SpotTypeID != &zero {
		ue.SpotTypeID = uu.SpotTypeID
	}

}

func checkSpot(db *gorm.DB, spotTypeId int) error {
	spot, err := GetSpotById(db, strconv.Itoa(spotTypeId))
	if err != nil {
		return errors.New("bad Spottype")
	}
	if spot.CurrentCount == spot.Limit {
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
		if err := db.Preload("SpotType").First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		var uu UserUpdate
		if err := c.ShouldBindJSON(&uu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		zero := uint(0)
		// check SpotType
		if uu.SpotTypeID != nil && uu.SpotTypeID != &zero {
			if err := checkSpot(db, int(*uu.SpotTypeID)); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Bad Spottype."})
				return
			}
		}

		// cannot set this through this endpoint
		uu.Type = nil
		uu.Username = nil
		uu.AmountPaid = nil
		if uu.GivesSoli != nil && uu.TakesSoli != nil && *uu.GivesSoli && *uu.TakesSoli {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Du kannst den Soli nicht gleichzeitig geben und nehmen."})
			return
		}

		updateUser(&userExist, uu)
		db.Save(&userExist)
		if uu.SpotTypeID != nil {
			if err := db.Model(&userExist).Association("SpotType").Find(&userExist.SpotType); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Konnte den SpotType nach Update nicht laden."})
				return
			}
		}
		// Need to reload the Association after changing the Foreign Key
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
		if err := db.Preload("SpotType").Find(&users).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
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
		if uu.SpotTypeID != nil {
			if err := checkSpot(db, int(*uu.SpotTypeID)); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Bad Spottype."})
				return
			}
		}
		if uu.GivesSoli != nil && uu.TakesSoli != nil && *uu.GivesSoli && *uu.TakesSoli {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Du kannst nicht Soli geben und nehmen gleichzeitig."})
			return
		}
		updateUser(&userExist, uu)
		db.Save(&userExist)

		// Need to reload the Association after changing the Foreign Key
		if uu.SpotTypeID != nil {
			if err := db.Model(&userExist).Association("SpotType").Find(&userExist.SpotType); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Konnte den SpotType nach Update nicht laden."})
				return
			}
		}
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
		if err := db.First(&userExist, "ID = ?", uid).Error; err != nil {
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
			return
		}
		uid := c.Param("id")
		var userExist models.User
		if err := db.First(&userExist, "ID = ?", uid).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve user."})
			return
		}
		db.Delete(&userExist)
		c.JSON(http.StatusOK, userExist.ToResponse())
	}
}
