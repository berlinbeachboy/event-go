package util

var env string = "DEV"

func Env() string {
	return env
}

func SetEnv(env_in string) {
	env = env_in
}

func EnvIsProd() bool{
	return env == "PROD"
}