package handlers

import (
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"sfpr/models"
	"sfpr/util"
)

type ShiftUpdate struct {
	Name        *string    `json:"name"`
	HeadCount   *uint8     `json:"headCount"`
	Points      *uint8     `json:"points"`
	Description *string    `json:"description"`
	Day         *string    `json:"day"`
	StartTime   *time.Time `json:"startTime" time_format:"2006-01-02T15:00:00"`
}

type ShiftCreate struct {
	Name        string     `json:"name" binding:"required"`
	HeadCount   uint8      `json:"headCount" binding:"required"`
	Points      *uint8     `json:"points"`
	Description *string    `json:"description"`
	Day         *string    `json:"day"`
	StartTime   *time.Time `json:"startTime" time_format:"2006-01-02T15:00:00"`
}

type ShiftOut struct {
	ID           uint       `json:"id"`
	Name         string     `json:"name"`
	HeadCount    uint8      `json:"headCount"`
	Points       uint8      `json:"points"`
	Day          *string    `json:"day"`
	Description  *string    `json:"description"`
	StartTime    *time.Time `json:"startTime"`
	CurrentCount uint8      `json:"currentCount"`
	UserNames    *[]string  `json:"userNames"`
}

// CsvShiftData represents the data structure from the CSV file
// type CsvShiftData struct {
// 	Name        string
// 	HeadCount   uint8
// 	Points      uint8
// 	Description *string
// 	Day         *string
// 	StartTime   *string // We'll parse this from HH:mm format
// }

// CRUD

func GetShiftById(db *gorm.DB, id string) (models.Shift, error) {
	var shiftExist models.Shift
	if err := db.Preload("Users").First(&shiftExist, "id = ?", id).Error; err != nil {
		return shiftExist, err
	}
	return shiftExist, nil
}

func GetShiftsWithUserNames(db *gorm.DB) ([]ShiftOut, error) {
	var shifts []models.Shift
	var shiftsWithUserNames []ShiftOut

	// First, load shifts with their users
	if err := db.Preload("Users").Find(&shifts).Error; err != nil {
		return nil, err
	}

	// Transform the shifts to include only user names
	for _, shift := range shifts {
		var userNames []string
		for _, user := range shift.Users {
			userNames = append(userNames, *user.FullName)
		}

		shiftsWithUserNames = append(shiftsWithUserNames, ShiftOut{
			ID:           shift.ID,
			Name:         shift.Name,
			StartTime:    shift.StartTime,
			Points:       shift.Points,
			Description:  shift.Description,
			Day:          shift.Day,
			HeadCount:    shift.HeadCount,
			CurrentCount: uint8(len(userNames)),
			UserNames:    &userNames,
		})
	}

	return shiftsWithUserNames, nil
}

// AddUserToShift adds a user to a shift
func AddUserToShift(db *gorm.DB, shiftID, userID uint) error {
	var shift models.Shift
	if err := db.Preload("Users").First(&shift, shiftID).Error; err != nil {
		return err
	}
	if len(shift.Users) >= int(shift.HeadCount) {
		return errors.New("this shift is already full :/")
	}

	for _, s := range shift.Users {
		if s.ID == userID {
			return errors.New("user is already in this shift")
		}
	}

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		return err
	}

	// Add the user to the shift
	return db.Model(&shift).Association("Users").Append(&user)
}

// RemoveUserFromShift removes a user from a shift
func RemoveUserFromShift(db *gorm.DB, shiftID, userID uint) error {
	var shift models.Shift
	if err := db.Preload("Users").First(&shift, shiftID).Error; err != nil {
		return err
	}
	found := false
	for _, s := range shift.Users {
		if s.ID == userID {
			found = true
		}
	}
	if !found {
		return errors.New("user is not part of this shift (yet)")
	}

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		return err
	}

	// Remove the user from the shift
	return db.Model(&shift).Association("Users").Delete(&user)
}

// ##########
// Handlers
// ##########

func HandleCreateShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// util.CheckUser(c)
		var sc ShiftCreate
		if err := c.ShouldBindJSON(&sc); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		stc := models.Shift{
			Name:        sc.Name,
			HeadCount:   sc.HeadCount,
			Description: sc.Description,
			Day:         sc.Day,
			StartTime:   sc.StartTime,
			Points:      *sc.Points,
		}
		fmt.Println("Desc is " + *sc.Description)
		if err := db.Create(&stc).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Shift"})
			return
		}
		c.IndentedJSON(http.StatusCreated, stc)
	}
}

func HandleGetShifts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shifts, err := GetShiftsWithUserNames(db)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		c.IndentedJSON(http.StatusOK, shifts)
	}
}

func HandlePutShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		util.CheckUser(c)
		uid := c.Param("id")
		shiftExist, err := GetShiftById(db, uid)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve shift type."})
			return
		}
		var su ShiftUpdate
		if err := c.ShouldBindJSON(&su); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if su.Name != nil {
			shiftExist.Name = *su.Name
		}
		if su.HeadCount != nil {
			shiftExist.HeadCount = *su.HeadCount
		}
		if su.Description != nil {
			shiftExist.Description = su.Description
		}
		if su.Day != nil {
			shiftExist.Day = su.Day
		}
		if su.Points != nil {
			shiftExist.Points = *su.Points
		}
		if su.StartTime != nil {
			shiftExist.StartTime = su.StartTime
		}

		db.Save(&shiftExist)
		c.JSON(http.StatusOK, shiftExist)

	}
}

func HandleAddUserToShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("user_id")
		sid := c.Param("shift_id")
		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)
		userIDUint, _ := strconv.ParseUint(uid, 10, 32)

		if err := AddUserToShift(db, uint(shiftIDUint), uint(userIDUint)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
	}
}

func HandleAddMeToShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := c.Param("shift_id")
		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)

		userId, exists := c.Get("user_id")
		userId2 := userId.(uint)
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
			return
		}

		if err := AddUserToShift(db, uint(shiftIDUint), userId2); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
	}
}

func HandleRemoveUserFromShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("user_id")
		sid := c.Param("shift_id")
		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)
		userIDUint, _ := strconv.ParseUint(uid, 10, 32)

		if err := RemoveUserFromShift(db, uint(shiftIDUint), uint(userIDUint)); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User removed from shift successfully"})
	}
}

func HandleRemoveMeFromShift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sid := c.Param("shift_id")
		shiftIDUint, _ := strconv.ParseUint(sid, 10, 32)

		userId, exists := c.Get("user_id")
		userId2 := userId.(uint)
		fmt.Println("User ID: " + strconv.FormatUint(uint64(userId2), 10))
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
			return
		}

		if err := RemoveUserFromShift(db, uint(shiftIDUint), userId2); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User added to shift successfully"})
	}
}

func HandleDeleteshift(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("shift_id")
		shiftExist, err := GetShiftById(db, uid)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve shift type."})
			return
		}
		db.Delete(&shiftExist)
		c.JSON(http.StatusOK, shiftExist)
	}
}

// Ingest CSV for shifts

// ValidateDayValue checks if the day value is one of the allowed values
func validateDayValue(day string) bool {
	validDays := []string{"Montag", "Freitag", "Samstag", "Sonntag"}
	for _, validDay := range validDays {
		if day == validDay {
			return true
		}
	}
	return false
}

// ImportShiftsFromCSV handles CSV file upload and imports data to shifts table
func ImportShiftsFromCSV(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get file from request
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}

		// Verify file is CSV
		if !strings.HasSuffix(strings.ToLower(file.Filename), ".csv") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File must be CSV format"})
			return
		}

		// Open the file
		openedFile, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer openedFile.Close()

		// Parse CSV
		reader := csv.NewReader(openedFile)
		records, err := reader.ReadAll()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse CSV"})
			return
		}

		if len(records) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "CSV file is empty or has no data rows"})
			return
		}

		// Process headers (case-insensitive)
		headers := make(map[string]int)
		for i, header := range records[0] {
			headers[strings.ToLower(header)] = i
		}

		// Validate required headers exist
		requiredHeaders := []string{"name", "headcount"}
		for _, header := range requiredHeaders {
			if _, exists := headers[header]; !exists {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("Required header '%s' not found in CSV", header),
				})
				return
			}
		}

		// Process data rows
		shifts := []models.Shift{}
		errors := []string{}

		for i, record := range records[1:] {
			rowNum := i + 2 // +1 for 0-index, +1 for header row

			// Skip empty rows
			if len(record) == 0 {
				continue
			}

			shift, err := processShiftRow(record, headers)
			if err != nil {
				errors = append(errors, fmt.Sprintf("Row %d: %s", rowNum, err.Error()))
				continue
			}

			shifts = append(shifts, shift)
		}

		// if len(errors) > 0 {
		// 	c.JSON(http.StatusBadRequest, gin.H{
		// 		"error":  "Some rows could not be processed",
		// 		"errors": errors,
		// 	})
		// 	return
		// }

		// Save to database using a transaction
		tx := db.Begin()
		for _, shift := range shifts {
			if err := tx.Create(&shift).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to save shifts to database",
				})
				return
			}
		}
		tx.Commit()

		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("%d Schichten wurden importiert. Bei %d Zeilen gab es Probleme", len(shifts), len(errors)),
		})
	}
}

// processShiftRow processes a single row from the CSV
func processShiftRow(record []string, headers map[string]int) (models.Shift, error) {
	shift := models.Shift{}

	// Process Name (required)
	nameIdx, exists := headers["name"]
	if !exists || nameIdx >= len(record) {
		return shift, fmt.Errorf("name field missing")
	}
	shift.Name = strings.TrimSpace(record[nameIdx])
	if shift.Name == "" {
		return shift, fmt.Errorf("name cannot be empty")
	}

	// Process HeadCount (required)
	headCountIdx, exists := headers["headcount"]
	if !exists || headCountIdx >= len(record) {
		return shift, fmt.Errorf("HeadCount field missing")
	}
	var headCount uint8
	_, err := fmt.Sscanf(record[headCountIdx], "%d", &headCount)
	if err != nil {
		return shift, fmt.Errorf("invalid HeadCount value: %s", record[headCountIdx])
	}
	shift.HeadCount = headCount

	// Process Points (optional, default 1)
	shift.Points = 1 // Default value
	if pointsIdx, exists := headers["points"]; exists && pointsIdx < len(record) && record[pointsIdx] != "" {
		var points uint8
		_, err := fmt.Sscanf(record[pointsIdx], "%d", &points)
		if err != nil {
			return shift, fmt.Errorf("invalid Points value: %s", record[pointsIdx])
		}
		shift.Points = points
	}

	// Process Description (optional)
	if descIdx, exists := headers["description"]; exists && descIdx < len(record) && record[descIdx] != "" {
		desc := strings.TrimSpace(record[descIdx])
		shift.Description = &desc
	}

	// Process Day (optional)
	if dayIdx, exists := headers["day"]; exists && dayIdx < len(record) && record[dayIdx] != "" {
		day := strings.TrimSpace(record[dayIdx])
		if !validateDayValue(day) {
			return shift, fmt.Errorf("invalid Day value: %s. Must be one of [Montag, Freitag, Samstag, Sonntag]", day)
		}
		shift.Day = &day
	}

	// Process StartTime (optional)
	if timeIdx, exists := headers["starttime"]; exists && timeIdx < len(record) && record[timeIdx] != "" {
		timeStr := strings.TrimSpace(record[timeIdx])

		// Parse time in HH:mm format
		t, err := time.Parse("15:04", timeStr)
		if err != nil {
			return shift, fmt.Errorf("invalid StartTime format: %s. Expected HH:mm", timeStr)
		}

		// Use current date for the time value to create a full timestamp
		now := time.Now()
		fullTime := time.Date(now.Year(), now.Month(), now.Day(), t.Hour(), t.Minute(), 0, 0, now.Location())
		shift.StartTime = &fullTime
	}

	return shift, nil
}
