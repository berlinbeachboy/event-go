package middleware

import (
	"net/http"
	"sfpr/models"
	"strings"

	"sfpr/util"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func getTokenUsername(c *gin.Context) string {
	// allow httponly cookie as well as Authorization HEader w/ Bearer Token
	cookie, err := c.Cookie("jwt")
	tok := ""
	if err == nil {
		tok = cookie
	} else {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			c.Abort()
			return ""
		}
		ss := strings.Split(tokenString, " ")
		tok = ss[1]
	}
	claims := &util.Claims{}
	token, err := jwt.ParseWithClaims(tok, claims, func(token *jwt.Token) (interface{}, error) {
		return util.JWTKey(), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return ""
	}
	return claims.Username
}

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := getTokenUsername(c)
		var userExist models.User
		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
			c.Abort()
			return
		}
		if !userExist.IsActivated {
			c.JSON(http.StatusForbidden, gin.H{"error": "User ist not activated yet. Please activate by clicking the Link in the Verfication Email."})
			c.Abort()
			return
		}
		c.Set("username", username)
		c.Next()
	}
}

func AdminMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := getTokenUsername(c)
		var userExist models.User
		if err := db.First(&userExist, "username = ?", username).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User is not in DB."})
			c.Abort()
			return
		}
		if !userExist.IsActivated {
			c.JSON(http.StatusForbidden, gin.H{"error": "User ist not activated yet. Please activate by clicking the Link in the Verfication Email."})
			c.Abort()
			return
		}
		if userExist.Type != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin only."})
			c.Abort()
			return
		}
		c.Set("username", username)
		c.Set("admin", 1)
		c.Next()
	}
}
