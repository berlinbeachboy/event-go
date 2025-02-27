package models

import (
	"time"
)

var soliAmount int

// Getter
func SoliAmount() int {
	return soliAmount
}

func SetSoliAmount(amount int) {
	soliAmount = amount
}

type User struct {
	ID         uint       `gorm:"primarykey" json:"id"`
	Username   *string    `gorm:"null;index" json:"username"`
	Password   *string    `gorm:"null" json:"-"`
	Type       string     `gorm:"not null" json:"type"`
	Nickname   string     `gorm:"unique;not null" json:"nickname"`
	FullName   *string    `gorm:"null" json:"fullName"`
	Phone      *string    `gorm:"null" json:"phone"`
	SoliAmount  float32  `gorm:"not null;default:0" json:"soliAmount"`
	// GivesSoli  bool       `gorm:"not null;default:false" json:"givesSoli"`
	TakesSoli  bool       `gorm:"not null;default:false" json:"takesSoli"`
	LastLogin  *time.Time `gorm:"null;default:null" json:"lastLogin"`
	AmountPaid float32    `gorm:"not null;default:0" json:"amountPaid"`
	IsActivated bool    `gorm:"not null;default:false" json:"-"`

	VerificationToken *string    `gorm:"null" json:"-"`
	TokenExpiryTime   *time.Time `gorm:"null" json:"-"`

	CreatedAt time.Time `json:"createdAt"` // Automatically managed by GORM for creation time
	UpdatedAt time.Time `json:"updatedAt"` // Automatically managed by GORM for update time

	SpotTypeID *uint     `gorm:"null" json:"spotTypeId"`
	SpotType   *SpotType `gorm:"null" json:"spotType"`
}

func (u User) AmountToPay() float32 {
	if u.SpotTypeID == nil {
		return 0
	}
	if u.LastLogin == nil {

	}
	// givesSoli := 0
	// if u.GivesSoli {
	// 	givesSoli = SoliAmount()
	// }
	takesSoli := 0
	if u.TakesSoli {
		takesSoli = SoliAmount()
	}
	return float32(u.SpotType.Price) + u.SoliAmount - float32(takesSoli) - u.AmountPaid
}

type UserResponse struct {
	ID          uint       `json:"id"`
	Username    *string    `json:"username"`
	Type        string     `json:"type"`
	Nickname    string     `json:"nickname"`
	FullName    *string    `json:"fullName"`
	Phone       *string    `json:"phone"`
	SoliAmount  float32   `json:"soliAmount"`
	TakesSoli   bool       `json:"takesSoli"`
	LastLogin   *time.Time `json:"lastLogin"`
	AmountToPay float32    `json:"amountToPay"`
	AmountPaid  float32    `json:"amountPaid"`

	CreatedAt time.Time `json:"createdAt"`

	SpotTypeID *uint     `json:"spotTypeId"`
	SpotType   *SpotType `json:"spotType"`
}

func (u User) ToResponse() UserResponse {
	return UserResponse{
		ID:          u.ID,
		Username:    u.Username,
		Type:        u.Type,
		Nickname:    u.Nickname,
		FullName:    u.FullName,
		Phone:       u.Phone,
		SoliAmount:  u.SoliAmount,
		TakesSoli:   u.TakesSoli,
		LastLogin:   u.LastLogin,
		AmountToPay: u.AmountToPay(),
		AmountPaid:  u.AmountPaid,

		SpotTypeID: u.SpotTypeID,
		SpotType:   u.SpotType,

		CreatedAt: u.CreatedAt,
	}
}

// For handling lists of users
func ToUsersResponseList(users []User) []UserResponse {
	response := make([]UserResponse, len(users))
	for i, user := range users {
		response[i] = user.ToResponse()
	}
	return response
}

type SpotType struct {
	ID           uint    `gorm:"primarykey" json:"id"`
	Name         string  `gorm:"not null" json:"name"`
	Price        uint16  `gorm:"not null" json:"price"`
	Limit        uint16  `gorm:"not null" json:"limit"`
	Description  *string `gorm:"null" json:"description"`
	CurrentCount uint16  `gorm:"->" json:"currentCount"`

	CreatedAt time.Time `json:"createdAt"` // Automatically managed by GORM for creation time
	UpdatedAt time.Time `json:"updatedAt"` // Automatically managed by GORM for update time
}
