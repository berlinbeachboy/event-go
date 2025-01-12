package main

import (
	"fmt"
	"log"
	"os"
	"sfpr/handlers"
	"sfpr/models"
	"sfpr/util"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func addAdmin(db *gorm.DB) {
	mainAdmin := "p@p.com"
	var userExist models.User
	if err := db.First(&userExist, "username = ?", mainAdmin).Error; err != nil {
		adminPW := os.Getenv("ADMIN_PASSWORD")
		if adminPW == "" {
			adminPW = "TEST_PASSWORD"
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(adminPW), bcrypt.DefaultCost)
		hpstring := string(hashedPassword)
		user := models.User{
			Username:    &mainAdmin,
			Password:    &hpstring,
			Type:        "admin",
			Nickname:    "Pete",
			IsActivated: true,
		}
		if err := db.Create(&user).Error; err != nil {
			log.Println("could not create admin user")
		} else {
			log.Println("created admin user " + mainAdmin)
		}
	}
}

func addHausplatz(db *gorm.DB) {
	var hausPlatz models.SpotType
	if err := db.First(&hausPlatz, "name = ?", "Hausplatz").Error; err != nil {
		hausplatz := models.SpotType{
			Name:        "Hausplatz",
			Limit:       42,
			Price:       210,
			Description: util.StrPtr("Bekommen Matratze, Bettzeug & Handtuch im Mehrbettzimmer gestellt."),
		}
		if err := db.Create(&hausplatz).Error; err != nil {
			log.Println("could not create hausplatz")
		} else {
			log.Println("Created Hausplatz Spot Type")
		}
	}
	var zeltPlatz models.SpotType
	if err := db.First(&zeltPlatz, "name = ?", "Zeltplatz").Error; err != nil {
		hausplatz := models.SpotType{
			Name:        "Zeltplatz",
			Limit:       20,
			Price:       150,
			Description: util.StrPtr("Muss Zelt, Iso etc. mitbringen."),
		}
		if err := db.Create(&hausplatz).Error; err != nil {
			log.Println("could not create Zeltplatz")
		} else {
			log.Println("Created Zeltplatz Spot Type")
		}
	}
}

func main() {

	env := os.Getenv("ENV")
	if env != "" {
		util.SetEnv(env)
	}
	util.SetEmailConfig()

	fmt.Println("Starting Backend... Waiting 3s for DB to come up")
	time.Sleep(3 * time.Second)

	dsn := util.DBDSN()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	addAdmin(db)
	addHausplatz(db)
	models.SetSoliAmount(25)

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "testing_secret"
	}
	// Set the JWT secret globally
	util.SetJWTKey(jwtSecret)

	sitePW := os.Getenv("SITE_PASSWORD")
	if sitePW == "" {
		sitePW = "schoenfeld_wird_supa"
	}

	// Set the Site Password globally
	util.SetSitePW(sitePW)

	// Initialize Gin router
	r := handlers.SetupRouter(db)
	// Run the server
	r.Run(":8080")
}
