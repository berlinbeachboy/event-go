package util

import (
	"log"
	"os"
)

func DBDSN() string {

	// Load environment variables
	dbHost := os.Getenv("POSTGRES_HOST")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")
	dbPort := os.Getenv("POSTGRES_PORT")

	if dbHost == "" {
		dbHost = "localhost"
	}
	if dbUser == "" {
		dbUser = "pr"
	}
	if dbName == "" {
		dbName = "sfv2"
	}
	if dbPort == "" {
		dbPort = "5432"
	}

	// Validate required variables
	if dbPassword == "" {
		log.Fatal("Need to at least set the POSTGRES_PASSWORD env variable")
	}

	return "host=" + dbHost + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " port=" + dbPort + " sslmode=disable"
}
