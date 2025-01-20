package util

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var sitePW string

func SitePW() string {
	return sitePW
}

func SetSitePW(pw string) {
	sitePW = pw
}

var jwtKey []byte

func JWTKey() []byte {
	return jwtKey
}

func SetJWTKey(secret string) {
	jwtKey = []byte(secret)
}

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func MakeJWT(username string) (string, error) {
	jwtKey := JWTKey()

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	return tokenString, err
}

func CheckUser(c *gin.Context) {
	_, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user."})
		return
	}
}
