package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"sfpr/models"
	"sfpr/util"
)

type SpotUpdate struct {
	Name        *string `json:"name"`
	Price       *uint16 `json:"price"`
	Limit       *uint16 `json:"limit"`
	Description *string `json:"description"`
}

type SpotCreate struct {
	Name        string  `json:"name"`
	Price       uint16  `json:"price"`
	Limit       uint16  `json:"limit"`
	Description *string `json:"description"`
}

func GetSpotById(db *gorm.DB, id string) (models.SpotType, error) {
	var spotExist models.SpotType
	subQuery := db.Select("count(*)").Where("users.spot_type_id = spot_types.id").Table("users")
	query := db.Select("*, (?) as current_count", subQuery)
	err := query.First(&spotExist, id).Error
	if err != nil {
		return spotExist, err
	}

	return spotExist, nil
}

func GetSpots(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var spotTypes []models.SpotType

		subQuery := db.Select("count(*)").Where("users.spot_type_id = spot_types.id").Table("users")
		query := db.Select("*, (?) as current_count", subQuery)
		err := query.Find(&spotTypes).Error
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Could not retrive Spots."})
			return
		}
		c.IndentedJSON(http.StatusOK, spotTypes)
	}
}

func CreateSpot(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		util.CheckUser(c)
		var sc SpotCreate
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		stc := models.SpotType{
			Name:        sc.Name,
			Limit:       sc.Limit,
			Price:       sc.Price,
			Description: sc.Description,
		}
		if err := db.Create(&stc).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create spottype"})
			return
		}
		c.IndentedJSON(http.StatusCreated, stc)
	}
}

func PutSpot(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		util.CheckUser(c)
		uid := c.Param("id")
		spotExist, err := GetSpotById(db, uid)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve spot type."})
			return
		}
		var su SpotUpdate
		if err := c.ShouldBindJSON(&su); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if su.Name != nil {
			spotExist.Name = *su.Name
		}
		if su.Limit != nil {
			spotExist.Limit = *su.Limit
		}
		if su.Description != nil {
			spotExist.Description = su.Description
		}
		if su.Price != nil {
			spotExist.Price = *su.Price
		}

		db.Save(&spotExist)
		c.JSON(http.StatusOK, spotExist)

	}
}

func DeleteSpot(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		util.CheckUser(c)
		uid := c.Param("id")
		spotExist, err := GetSpotById(db, uid)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve spot type."})
			return
		}
		db.Delete(&spotExist)
		c.JSON(http.StatusOK, spotExist)
	}
}
