package handlers

import (
	"crypto/rand"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"net/http"
	"os"
	"path/filepath"
	"sfpr/models"
	"sfpr/util"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nfnt/resize" // You'll need to install this: go get -u github.com/nfnt/resize
	"gorm.io/gorm"
)

const (
	AvatarStoragePath = "/var/images/avatars" // Change this path as needed
	SmallAvatarSize   = 64                    // Size for small avatar in pixels
	LargeAvatarSize   = 256                   // Size for large/normal avatar in pixels
)

// AvatarUploadResponse is the response for avatar upload
type AvatarUploadResponse struct {
	AvatarUrl      string `json:"avatarUrl"`
	SmallAvatarUrl string `json:"smallAvatarUrl"`
}

// setupAvatarStorage ensures the avatar storage directory exists
func setupAvatarStorage() error {
	return os.MkdirAll(AvatarStoragePath, os.ModePerm)
}

func randomString(length int) string {
	b := make([]byte, length+2)
	rand.Read(b)
	return fmt.Sprintf("%x", b)[2 : length+2]
}

// UploadAvatar handles avatar image upload, resizing and saving
func UploadAvatar(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Make sure the storage directory exists
		if err := setupAvatarStorage(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to setup storage directory"})
			return
		}

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

		// Get the file from the request
		file, header, err := c.Request.FormFile("avatar")
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": "No avatar file provided"})
			return
		}
		defer file.Close()

		// Check file size (limit to 5MB)
		if header.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File too large (max 5MB)"})
			return
		}

		// Check file type
		contentType := header.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File must be an image"})
			return
		}

		// Create a unique filename
		//timestamp := fmt.Sprintf("%d", time.Now().Unix())
		fileExt := strings.ToLower(filepath.Ext(header.Filename))
		if fileExt == "" {
			// Assign extension based on content type
			switch contentType {
			case "image/jpeg", "image/jpg":
				fileExt = ".jpg"
			case "image/png":
				fileExt = ".png"
			default:
				fileExt = ".jpg" // Default to jpg
			}
		}
		randStr := randomString(8)
		// baseFilename := fmt.Sprintf("%s_%s", userID, timestamp)
		// filename := baseFilename + fileExt
		largeFilename := randStr + "_lg" + fileExt
		smallFilename := randStr + "_sm" + fileExt

		// Read and decode the image
		var img image.Image
		var decodeErr error

		if strings.HasSuffix(fileExt, ".png") {
			img, decodeErr = png.Decode(file)
		} else {
			// Default to JPEG decoding for all other types
			img, decodeErr = jpeg.Decode(file)
		}

		if decodeErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to decode image"})
			return
		}

		// Create two resized versions of the image
		largeImg := resize.Resize(LargeAvatarSize, LargeAvatarSize, img, resize.Lanczos3)
		smallImg := resize.Resize(SmallAvatarSize, SmallAvatarSize, img, resize.Lanczos3)

		// Save the resized images
		largePath := filepath.Join(AvatarStoragePath, largeFilename)
		smallPath := filepath.Join(AvatarStoragePath, smallFilename)

		// Save large image
		largeFile, err := os.Create(largePath)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
			return
		}
		defer largeFile.Close()

		// Save small image
		smallFile, err := os.Create(smallPath)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save avatar"})
			return
		}
		defer smallFile.Close()

		// Encode and save as JPEG
		if err := jpeg.Encode(largeFile, largeImg, &jpeg.Options{Quality: 90}); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save large avatar"})
			return
		}

		if err := jpeg.Encode(smallFile, smallImg, &jpeg.Options{Quality: 85}); err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save small avatar"})
			return
		}

		// Create URLs for the avatars
		var baseURL string
		if util.EnvIsProd() {
			baseURL = "/api/avs/"
		} else {
			baseURL = "http://localhost:8080/api/avs/"
		}

		largeAvatarURL := baseURL + largeFilename
		smallAvatarURL := baseURL + smallFilename

		userExist.AvatarUrlSm = &smallAvatarURL
		userExist.AvatarUrlLg = &largeAvatarURL

		db.Save(&userExist)

		// Return the URLs to the client
		c.JSON(http.StatusOK, AvatarUploadResponse{
			AvatarUrl:      largeAvatarURL,
			SmallAvatarUrl: smallAvatarURL,
		})
	}
}
