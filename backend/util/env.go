package util

var env string = "DEV"


func Env() string {
	return env
}

func SetEnv(env_in string) {
	env = env_in
	if env == "PROD" {
		SetApiBaseURL("https://schoenfeld.fun")
	}
	if env == "PROD" {
		SetFrontendBaseURL("https://schoenfeld.fun")
	}
}

func EnvIsProd() bool{
	return env == "PROD"
}

var apiBaseURL string = "http://localhost:8080"


func ApiBaseURL() string {
	return apiBaseURL
}

func SetApiBaseURL(apiBaseURL_in string) {
	apiBaseURL = apiBaseURL_in
}

var frontendBaseURL string = "http://localhost:5173"


func FrontendBaseURL() string {
	return frontendBaseURL
}

func SetFrontendBaseURL(frontendBaseURL_in string) {
	frontendBaseURL = frontendBaseURL_in
}