package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"sfpr/models"
	"sfpr/util"
	"strconv"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var testDB *gorm.DB // Global variable to hold the test database connection

var AdminEmail string = "p@p.com"

func getToken(email string) string {
	token, _ := util.MakeJWT(email)
	return token
}

func sendReq(router *gin.Engine, method string, path string, body *string, token *string) (int, []byte) {
	w := httptest.NewRecorder()
	var req *http.Request
	if body != nil {
		req, _ = http.NewRequest(method, path, strings.NewReader(*body))
	} else {
		req, _ = http.NewRequest(method, path, nil)
	}

	if token != nil {
		req.Header.Set("Authorization", "Bearer "+*token)
	}

	router.ServeHTTP(w, req)
	res_body, _ := io.ReadAll(w.Body)
	return w.Code, res_body
}

func umGeneric(resBody []byte) map[string]interface{} {
	var response map[string]interface{}
	if err := json.Unmarshal(resBody, &response); err != nil {
		fmt.Println("could not unmarshal response")
		fmt.Println(string(resBody))
		fmt.Println(err)
		return nil
	}
	return response
}

func checkRes(t *testing.T, code int, expectedCode int, body map[string]interface{}) {
	if code != expectedCode {
		assert.Equal(t, expectedCode, code)
		fmt.Println("Response was:")
		fmt.Println(body)
	}
}

func TestMain(m *testing.M) {
	// Setup code here
	// Connect to the test database

	os.Setenv("POSTGRES_DB", "postgres")
	os.Setenv("POSTGRES_PASSWORD", "some_password")
	os.Setenv("JWT_SECRET", "some_secret")

	// os.Setenv("SMTP_SERVER", "smtp.xxx.de")
	// os.Setenv("SMTP_EMAIL", "xxx")
	// os.Setenv("SMTP_PASSWORD", "xxx")
	testDB, _ = gorm.Open(postgres.Open(util.DBDSN()), &gorm.Config{})
	util.SetSitePW("schoenfeld_wird_supa")
	util.SetEmailConfig()
	util.SetEnv("TEST")

	// Create tables, seed data, etc.
	// Migrate the schema
	err := testDB.AutoMigrate(&models.User{}, &models.SpotType{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("testpw"), bcrypt.DefaultCost)
	hpstring := string(hashedPassword)
	user := models.User{
		Username:    &AdminEmail,
		Password:    &hpstring,
		Type:        "admin",
		Nickname:    "Pete",
		FullName:    util.StrPtr("P R"),
		Phone:       nil,
		SpotTypeID:  nil,
		IsActivated: true,
	}
	testDB.Save(&user)

	// Run the tests
	exitCode := m.Run()

	// Teardown code here
	// Drop tables, clean up data, etc.
	os.Unsetenv("POSTGRES_DB")
	os.Unsetenv("POSTGRES_PASSWORD")
	os.Unsetenv("JWT_SECRET")
	// os.Unsetenv("SMTP_SERVER")
	// os.Unsetenv("SMTP_PASSWORD")
	// os.Unsetenv("SMTP_EMAIL")
	testDB.Exec("DELETE FROM users")
	os.Exit(exitCode)
}

func TestRegister(t *testing.T) {
	db := testDB.Begin()
	defer db.Rollback()

	router := SetupRouter(db)

	exampleUser := UserRegister{
		Username:     "ratz.phil@gmail.com",
		Password:     "testpw",
		FullName:     "Peter Person",
		Nickname:     "Petey",
		SitePassword: "bla",
	}
	// Get blocked b/c bad site pw
	userJson, _ := json.Marshal(exampleUser)
	userJsonString := string(userJson)
	code, _ := sendReq(router, "POST", "/api/register", &userJsonString, nil)

	if code != 400 {
		t.Errorf("Bad Code returned")
	}

	// successful register
	exampleUser.SitePassword = "schoenfeld_wird_supa"
	userJson, _ = json.Marshal(exampleUser)
	userJsonString = string(userJson)
	code, body := sendReq(router, "POST", "/api/register", &userJsonString, nil)
	if code != 201 {
		t.Errorf("Bad Code returned")
	}
	response := umGeneric(body)
	assert.Equal(t, "Peter Person", response["fullName"])
	uid := response["id"]

	// Check for the verification token
	var userExist models.User
	if err := db.First(&userExist, "ID = ?", uid).Error; err != nil {
		t.Errorf("Didnt find registered user")
	}
	assert.NotEmpty(t, userExist.VerificationToken)
	assert.False(t, userExist.IsActivated)

	// ensure that user cannot login yet
	creds := `{"username": "ratz.phil@gmail.com", "password": "testpw"}`
	code, _ = sendReq(router, "POST", "/api/login", &creds, nil)
	assert.Equal(t, 403, code)

	// bad token - should not verify
	verifyPath := "/api/verify?token=xxx"
	code, _ = sendReq(router, "GET", verifyPath, &userJsonString, nil)
	assert.Equal(t, 404, code)

	// verification successful
	verifyPath = fmt.Sprintf("/api/verify?token=%s", *userExist.VerificationToken)
	code, _ = sendReq(router, "GET", verifyPath, &userJsonString, nil)
	assert.Equal(t, 200, code)
}

func TestResetPW(t *testing.T) {
	db := testDB.Begin()
	defer db.Rollback()
	router := SetupRouter(db)

	code, _ := sendReq(router, "POST", "/api/requestPasswordReset", nil, nil)
	assert.Equal(t, 400, code)

	code, _ = sendReq(router, "POST", "/api/requestPasswordReset?username="+AdminEmail, nil, nil)
	assert.Equal(t, 200, code)

	// Check for the verification token
	var userExist models.User
	if err := db.First(&userExist, "username = ?", AdminEmail).Error; err != nil {
		t.Errorf("didnt find admin")
	}
	assert.NotEmpty(t, userExist.VerificationToken)

	// no token
	b := `{"token": "", "password": "blablab", "passwordConfirm": "blablab"}`
	code, _ = sendReq(router, "POST", "/api/resetPassword", &b, nil)
	assert.Equal(t, 400, code)

	// PWs not matching
	b = fmt.Sprintf(`{"token": "%s", "password": "blablab", "passwordConfirm": "blablab6"}`, *userExist.VerificationToken)
	code, _ = sendReq(router, "POST", "/api/resetPassword", &b, nil)
	assert.Equal(t, 400, code)

	// successful Pw change
	b = fmt.Sprintf(`{"token": "%s", "password": "blablab", "passwordConfirm": "blablab"}`, *userExist.VerificationToken)
	code, _ = sendReq(router, "POST", "/api/resetPassword", &b, nil)
	assert.Equal(t, 200, code)

	// login should work with new PW
	creds := fmt.Sprintf(`{"username": "%s", "password": "blablab"}`, AdminEmail)
	code, _ = sendReq(router, "POST", "/api/login", &creds, nil)
	assert.Equal(t, 200, code)

}
func TestLoginAndGetMe(t *testing.T) {
	tx := testDB.Begin()
	defer tx.Rollback()
	router := SetupRouter(tx)
	w := httptest.NewRecorder()

	exampleUser := Credentials{
		Username: AdminEmail,
		Password: "testpw",
	}
	userJson, _ := json.Marshal(exampleUser)
	req, _ := http.NewRequest("POST", "/api/login", strings.NewReader(string(userJson)))
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Bad Code returned")
	}
	var response map[string]string
	body, _ := io.ReadAll(w.Body)
	err := json.Unmarshal(body, &response)
	// Compare the response body with the json data of exampleUser
	assert.Nil(t, err)
	token := response["token"]
	assert.NotEmpty(t, token)

	req, _ = http.NewRequest("GET", "/api/user/me", nil)
	authValue := "Bearer " + string(token)
	req.Header.Set("Authorization", authValue)
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Bad Code returned")
	}
	body, _ = io.ReadAll(w.Body)
	var response2 map[string]interface{}
	err = json.Unmarshal(body, &response2)
	assert.Nil(t, err)
	assert.Equal(t, "Pete", response2["nickname"])
	assert.NotEmpty(t, response2["lastLogin"])
}

func TestPutMe(t *testing.T) {
	tx := testDB.Begin()
	defer tx.Rollback()
	router := SetupRouter(tx)
	w := httptest.NewRecorder()

	token := getToken(AdminEmail)
	uu := UserUpdate{
		FullName: util.StrPtr("Peter Pan"),
		Nickname: util.StrPtr("petey"),
		Type:     util.StrPtr("reg"),
	}
	jj, _ := json.Marshal(uu)
	req, _ := http.NewRequest("PUT", "/api/user/me", strings.NewReader(string(jj)))
	req.Header.Set("Authorization", "Bearer "+string(token))
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Bad Code returned")
	}
	body, _ := io.ReadAll(w.Body)
	var response2 map[string]interface{}
	err := json.Unmarshal(body, &response2)
	assert.Nil(t, err)
	assert.Equal(t, "petey", response2["nickname"])
	assert.Equal(t, "admin", response2["type"])

	// Now test Password Change:
	// First get it wrong, then right
	w = httptest.NewRecorder()
	pw := PWUpdate{
		Password:        "blablab",
		PasswordConfirm: "bloblab",
	}
	jj, _ = json.Marshal(pw)
	req, _ = http.NewRequest("PUT", "/api/user/me/pw", strings.NewReader(string(jj)))
	req.Header.Set("Authorization", "Bearer "+string(token))
	router.ServeHTTP(w, req)
	fmt.Println("Code is " + strconv.Itoa(w.Code))
	assert.Equal(t, 400, w.Code)

	w = httptest.NewRecorder()
	pw.PasswordConfirm = "blablab"
	jj, _ = json.Marshal(pw)
	req, _ = http.NewRequest("PUT", "/api/user/me/pw", strings.NewReader(string(jj)))
	req.Header.Set("Authorization", "Bearer "+string(token))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	w = httptest.NewRecorder()
	exampleUser := Credentials{Username: AdminEmail, Password: "blablab"}
	userJson, _ := json.Marshal(exampleUser)
	req, _ = http.NewRequest("POST", "/api/login", strings.NewReader(string(userJson)))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)
}

func TestPutUser(t *testing.T) {
	tx := testDB.Begin()
	defer tx.Rollback()
	router := SetupRouter(tx)

	token := getToken(AdminEmail)

	// test create user as admin
	code, body := sendReq(router, "POST", "/api/admin/users/", util.StrPtr(`{"nickname": "blub"}`), &token)
	assert.Equal(t, 201, code)
	bodyMap := umGeneric(body)
	assert.Equal(t, "blub", bodyMap["nickname"])
	userId := strconv.FormatFloat(bodyMap["id"].(float64), 'f', -1, 64)

	// test PUT user by id as admin
	putBody := `{"nickname": "blob", "username": "hello@blub.io", "phone": "12345"}`
	code, body = sendReq(router, "PUT", "/api/admin/users/"+userId, &putBody, &token)
	bodyMap = umGeneric(body)
	checkRes(t, 200, code, bodyMap)
	assert.Equal(t, "blob", bodyMap["nickname"])
	assert.Equal(t, "hello@blub.io", bodyMap["username"])

	token = getToken("hello@blub.io")
	// test create user as reg -> Fail
	code, body = sendReq(router, "POST", "/api/admin/users/", util.StrPtr(`{"nickname": "blib"}`), &token)
	bodyMap = umGeneric(body)
	checkRes(t, 403, code, bodyMap)

	// test PUT user as reg -> Fail
	code, body = sendReq(router, "PUT", "/api/admin/users/"+userId, &putBody, &token)
	bodyMap = umGeneric(body)
	checkRes(t, 403, code, bodyMap)
}

func TestSpotTypes(t *testing.T) {
	tx := testDB.Begin()
	defer tx.Rollback()
	router := SetupRouter(tx)

	token := getToken(AdminEmail)

	// test create user as admin
	b := `{"name": "zelt", "price": 76, "limit":20}`
	code, body := sendReq(router, "POST", "/api/admin/spots/", &b, &token)
	bodyMap := umGeneric(body)
	checkRes(t, 201, code, bodyMap)
	//fmt.Println(body)
	stid := strconv.FormatFloat(bodyMap["id"].(float64), 'f', -1, 64)

	b = `{"spotTypeId": 67}`
	code, body = sendReq(router, "PUT", "/api/user/me", &b, &token)
	bodyMap = umGeneric(body)
	checkRes(t, 400, code, bodyMap)

	b = fmt.Sprintf(`{"spotTypeId": %s}`, stid)
	code, body = sendReq(router, "PUT", "/api/user/me", &b, &token)
	bodyMap = umGeneric(body)
	checkRes(t, 200, code, bodyMap)
	assert.Equal(t, float64(76), bodyMap["amountToPay"])
	userId := strconv.FormatFloat(bodyMap["id"].(float64), 'f', -1, 64)

	b = `{"amountPaid": 50}`
	code, body = sendReq(router, "PUT", "/api/admin/users/"+userId, &b, &token)
	bodyMap = umGeneric(body)
	checkRes(t, 200, code, bodyMap)
	assert.Equal(t, float64(26), bodyMap["amountToPay"])

	code, body = sendReq(router, "GET", "/api/admin/spots/", nil, &token)
	assert.Equal(t, 200, code)
	var spotList []models.SpotType
	if err := json.Unmarshal(body, &spotList); err != nil {
		t.Errorf("Bad SpotType (list) Response")
	}
	assert.Equal(t, uint16(1), spotList[0].CurrentCount)

	code, body = sendReq(router, "GET", "/api/admin/users/", nil, &token)
	assert.Equal(t, 200, code)
	var usersList []models.UserResponse
	if err := json.Unmarshal(body, &usersList); err != nil {
		t.Errorf("Bad Users (list) Response")
	}
	assert.Equal(t, uint16(76), usersList[0].SpotType.Price)
}
