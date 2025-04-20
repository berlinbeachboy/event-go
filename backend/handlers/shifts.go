// package handlers

// import (
// 	"errors"
// 	"net/http"
// 	"strconv"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"

// 	"sfpr/models"
// 	"sfpr/util"
// )

// type ShiftUpdate struct {
// 	Name        *string `json:"name"`
// 	HeadCount   *uint8 `json:"headCount"`
// 	Points      *uint8 `json:"points"`
// 	Description *string `json:"description"`
// 	Time        *time.Time  `json:"time"`
// }

// type ShiftCreate struct {
// 	Name        string  `json:"name"`
// 	HeadCount   uint8  `json:"headCount"`
// 	Points      uint8  `json:"points"`
// 	Description *string `json:"description"`
// 	Time        *time.Time  `json:"time"`
// }

// type ShiftOut struct {
// 	ID           uint    `json:"id"`
// 	Name         string  `json:"name"`
// 	HeadCount    uint8   `json:"headCount"`
// 	Points       uint8   `json:"points"`
// 	Description  *string `json:"description"`
// 	Time  		*time.Time `json:"time"`
// 	CurrentCount uint8  `json:"currentCount"`
// 	UserNames *[]string  `json:"userNames"`
// }

// // CRUD

// func GetShiftById(db *gorm.DB, id string) (models.Shift, error) {
// 	var shiftExist models.Shift
//     if err := db.Preload("Users").First(&shiftExist, "id = ?", id).Error; err != nil {
//         return shiftExist, err
//     }
// 	return shiftExist, nil
// }


// func GetShiftsWithUserNames(db *gorm.DB) ([]ShiftOut, error) {
//     var shifts []models.Shift
//     var shiftsWithUserNames []ShiftOut

//     // First, load shifts with their users
//     if err := db.Preload("Users").Find(&shifts).Error; err != nil {
//         return nil, err
//     }

//     // Transform the shifts to include only user names
//     for _, shift := range shifts {
//         var userNames []string
//         for _, user := range shift.Users {
//             userNames = append(userNames, *user.FullName)
//         }

//         shiftsWithUserNames = append(shiftsWithUserNames, ShiftOut{
//             ID:     shift.ID,
//             Name:     shift.Name,
//             Time: shift.Time,
//             HeadCount:   shift.HeadCount,
// 			CurrentCount: uint8(len(userNames)),
//             UserNames: &userNames,
//         })
//     }

//     return shiftsWithUserNames, nil
// }

// // AddUserToShift adds a user to a shift
// func AddUserToShift(db *gorm.DB, shiftID, userID uint) error {
//     var shift models.Shift
//     if err := db.First(&shift, shiftID).Error; err != nil {
//         return err
//     }
// 	if len(shift.Users) >= int(shift.HeadCount) {
// 		return errors.New("this shift is already full :/")
// 	}
//     var user models.User
//     if err := db.First(&user, userID).Error; err != nil {
//         return err
//     }

// 	for _, s := range shift.Users {
// 		if s.Username == user.Username {
// 			return errors.New("user is already in this shift")
// 		}
// 	}

//     // Add the user to the shift
//     return db.Model(&shift).Association("Users").Append(&user)
// }

// // RemoveUserFromShift removes a user from a shift
// func RemoveUserFromShift(db *gorm.DB, shiftID, userID uint) error {
//     var shift models.Shift
//     if err := db.First(&shift, shiftID).Error; err != nil {
//         return err
//     }
//     var user models.User
//     if err := db.First(&user, userID).Error; err != nil {
//         return err
//     }
// 	found := false
// 	for _, s := range shift.Users {
// 		if s.Username == user.Username {
// 			found = true
// 		}
// 	}
// 	if !found {
// 		return errors.New("user is not part of this shift (yet)")
// 	}

//     // Remove the user from the shift
//     return db.Model(&shift).Association("Users").Delete(&user)
// }

// // ##########
// // Handlers
// // ##########


// func HandleCreateShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		// util.CheckUser(c)
// 		var sc ShiftCreate
// 		if err := c.ShouldBindJSON(&sc); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 			return
// 		}

// 		stc := models.Shift{
// 			Name:        sc.Name,
// 			HeadCount:   sc.HeadCount,
// 			Description: sc.Description,
// 			Time: sc.Time,
// 		}
// 		if err := db.Create(&stc).Error; err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Shift"})
// 			return
// 		}
// 		c.IndentedJSON(http.StatusCreated, stc)
// 	}
// }

// func HandleGetShifts(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		shifts, err := GetShiftsWithUserNames(db)
// 		if err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 			return
// 		}
// 		c.IndentedJSON(http.StatusOK, shifts)
// 	}
// }

// func HandlePutShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		util.CheckUser(c)
// 		uid := c.Param("id")
// 		shiftExist, err := GetShiftById(db, uid)
// 		if err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve shift type."})
// 			return
// 		}
// 		var su ShiftUpdate
// 		if err := c.ShouldBindJSON(&su); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 			return
// 		}

// 		if su.Name != nil {
// 			shiftExist.Name = *su.Name
// 		}
// 		if su.HeadCount != nil {
// 			shiftExist.HeadCount = *su.HeadCount
// 		}
// 		if su.Description != nil {
// 			shiftExist.Description = su.Description
// 		}
// 		if su.Time != nil {
// 			shiftExist.Time = su.Time
// 		}

// 		db.Save(&shiftExist)
// 		c.JSON(http.StatusOK, shiftExist)

// 	}
// }

// func HandleAddUserToShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		uid := c.Param("user_id")
// 		sid := c.Param("shift_id")
// 		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)
//     	userIDUint, _ := strconv.ParseUint(uid, 10, 32)
    
// 		if err := AddUserToShift(db, uint(shiftIDUint), uint(userIDUint)); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
		
// 		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
// 	}
// }

// func HandleAddMeToShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		sid := c.Param("shift_id")
// 		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)

// 		username, exists := c.Get("username")
// 		if !exists {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
// 			return
// 		}
// 		var userExist models.User
// 		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
// 			return
// 		}
    
// 		if err := AddUserToShift(db, uint(shiftIDUint), uint(userExist.ID)); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
		
// 		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
// 	}
// }



// func HandleRemoveUserToShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		uid := c.Param("user_id")
// 		sid := c.Param("shift_id")
// 		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)
//     	userIDUint, _ := strconv.ParseUint(uid, 10, 32)
    
// 		if err := RemoveUserFromShift(db, uint(shiftIDUint), uint(userIDUint)); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
		
// 		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
// 	}
// }

// func HandleRemoveMeToShift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		sid := c.Param("shift_id")
// 		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)

// 		username, exists := c.Get("username")
// 		if !exists {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
// 			return
// 		}
// 		var userExist models.User
// 		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
// 			return
// 		}
    
// 		if err := RemoveUserFromShift(db, uint(shiftIDUint), uint(userExist.ID)); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
		
// 		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
// 	}
// }

// func HandleDeleteshift(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		uid := c.Param("id")
// 		shiftExist, err := GetShiftById(db, uid)
// 		if err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve shift type."})
// 			return
// 		}
// 		db.Delete(&shiftExist)
// 		c.JSON(http.StatusOK, shiftExist)
// 	}
// }
