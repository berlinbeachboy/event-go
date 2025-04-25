package handlers

import (
	"net/http"
	"sfpr/middleware"
	"sfpr/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func HealthEP(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"success": "ok"})
	}
}

func SetupRouter(db *gorm.DB) *gin.Engine {

	if util.EnvIsProd() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	if util.EnvIsProd() {
		trustedProxies := []string{"http://localhost", "http://127.0.0.1", "https://schoenfeld.fun"}
		r.SetTrustedProxies(trustedProxies)
	}

	r.Use(middleware.CorsMiddleware())
	// Routes
	api := r.Group("/api")

	api.GET("/health", HealthEP(db))
	api.POST("/register", Register(db))
	api.POST("/login", Login(db))
	api.GET("/verify", Verify(db))
	api.POST("/requestPasswordReset", RequestPWReset(db))
	api.POST("/resetPassword", ResetPW(db))

	protected := api.Group("/user")
	protected.Use(middleware.AuthMiddleware(db))

	protected.POST("/logout", Logout(db))
	protected.GET("/me", GetMe(db))
	protected.PUT("/me", PutMe(db))
	protected.PUT("/me/pw", PutMePW(db))
	protected.GET("/spots", GetSpots(db))
	protected.GET("/spots/", GetSpots(db))
	protected.GET("/shifts", HandleGetShifts(db))
	protected.GET("/shifts/", HandleGetShifts(db))
	protected.POST("/shifts/:shift_id/me", HandleAddMeToShift(db))
	protected.DELETE("/shifts/:shift_id/me", HandleRemoveMeFromShift(db))

	admin := api.Group("/admin")
	admin.Use(middleware.AdminMiddleware(db))

	admin.GET("/users", GetUsers(db))
	admin.GET("/users/", GetUsers(db))
	admin.POST("/users", CreateUser(db))
	admin.POST("/users/", CreateUser(db))
	admin.PUT("/users/:id", PutUser(db))
	admin.PUT("/users/:id/pw", PutUserPW(db))
	admin.DELETE("/users/:id", DeleteUser(db))

	admin.GET("/spots", GetSpots(db))
	admin.GET("/spots/", GetSpots(db))
	admin.POST("/spots", CreateSpot(db))
	admin.POST("/spots/", CreateSpot(db))
	admin.PUT("/spots/:id", PutSpot(db))
	admin.DELETE("/spots/:id", DeleteSpot(db))

	admin.GET("/shifts", HandleGetShifts(db))
	admin.GET("/shifts/", HandleGetShifts(db))
	admin.POST("/shifts", HandleCreateShift(db))
	admin.POST("/shifts/", HandleCreateShift(db))
	admin.POST("/shifts/import", ImportShiftsFromCSV(db))
	admin.POST("/shifts/:shift_id/user/:user_id", HandleAddUserToShift(db))
	admin.DELETE("/shifts/:shift_id", HandleDeleteshift(db))
	admin.DELETE("/shifts/:shift_id/user/:user_id", HandleRemoveUserFromShift(db))
	admin.PUT("/shifts/:id", HandlePutShift(db))

	return r
}
