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
}

func EnvIsProd() bool{
	return env == "PROD"
}

var apiBaseURL string = "https://localhost"


func ApiBaseURL() string {
	return apiBaseURL
}

func SetApiBaseURL(apiBaseURL_in string) {
	apiBaseURL = apiBaseURL_in
}