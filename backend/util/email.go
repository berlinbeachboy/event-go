package util

import (
	"errors"
	"fmt"
	"net/smtp"
	"os"
	"time"
)

// EmailConfig holds SMTP configuration
type EmailConfigClass struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
	FromName string
}

var smtpPort int = 587

// Initialize email configuration
var emailConfig EmailConfigClass

var EmailsEnabled bool = true

func EmailConfig() EmailConfigClass {
	return emailConfig
}

func SetEmailConfig() {
	emailConfig = EmailConfigClass{
		Host:     os.Getenv("SMTP_SERVER"),
		Port:     smtpPort,
		Username: os.Getenv("SMTP_EMAIL"),
		From:     os.Getenv("SMTP_EMAIL"),
		FromName: "Peter Schoenfelder",
		Password: os.Getenv("SMTP_PASSWORD"),
	}

	if emailConfig.Host == "" || emailConfig.Username == "" || emailConfig.Password == "" {
		EmailsEnabled = false
		fmt.Printf("WARNING: Email Sending is disabled. SMTP ENV variables are not fully set.")
	}
	fmt.Println("Email Sending is enabled from server", emailConfig.Host, "and address", emailConfig.Username)
}

// sendVerificationEmail sends an email with verification link
func SendVerificationEmail(email string, verificationLink string, nickname string) error {
	message := []byte(fmt.Sprintf(
		"From: Peter Schoenfelder <%s>\r\n"+
			"To: %s\r\n"+
			"Subject: Bitte deine Email bestätigen\r\n"+
			"\r\n"+
			"Moin %s du geile Schnegge 🐌\r\n"+
			"\r\n"+
			"geil, dass du am Start bist! Dieses Jahr wird nochmal richtig fett! 🌟\r\n"+
			"Bitte klicke auf den folgenden Link um die Registrierung für Schönfeld 2025 abzuschließen:\r\n"+
			"\r\n"+
			"%s\r\n"+
			"\r\nDer Link ist 24h gültig.\r\n"+
			"Ciao Kakao <3",
		emailConfig.Username, email, nickname, verificationLink,
	))

	auth := smtp.PlainAuth(
		"",
		emailConfig.Username,
		emailConfig.Password,
		emailConfig.Host,
	)

	addr := fmt.Sprintf("%s:%d", emailConfig.Host, emailConfig.Port)
	// return TlsMailSmtp(
	// 	addr,
	// 	auth,
	// 	emailConfig.From,
	// 	[]string{email},
	// 	message,
	// )
	ch := make(chan error, 1)
	go func() { ch <- smtp.SendMail(addr, auth, emailConfig.From, []string{email}, message) } ()
	select {
	case err := <-ch:
		return err
		
	case <-time.After(10 * time.Second):
		return errors.New("timout sending email")
	}
}

// sendVerificationEmail sends an email with verification link
func SendPWResetEmail(email, verificationLink string, nickname string) error {
	message := []byte(fmt.Sprintf(
		"From: Peter Schoenfelder <%s>\r\n"+
			"To: %s\r\n"+
			"Subject: Passwort Reset\r\n"+
			"\r\n"+
			"Moin %s,\r\n"+
			"du hast dein Passwort also vergessen... lol\r\n"+
			"Na gut eine letzte Chance. Klicke auf den folgenden Link, um es zurueckzusetzen:\r\n"+
			"\r\n"+
			"%s\r\n"+
			"\r\nDer Link ist 24h gueltig.\r\n"+
			"Ciao Kakao <3",
		emailConfig.Username, email, nickname, verificationLink,
	))

	auth := smtp.PlainAuth(
		"",
		emailConfig.Username,
		emailConfig.Password,
		emailConfig.Host,
	)

	addr := fmt.Sprintf("%s:%d", emailConfig.Host, emailConfig.Port)
	// return TlsMailSmtp(
	// 	addr,
	// 	auth,
	// 	emailConfig.From,
	// 	[]string{email},
	// 	message,
	// )
	ch := make(chan error, 1)
	go func() { ch <- smtp.SendMail(addr, auth, emailConfig.From, []string{email}, message) } ()
	select {
	case err := <-ch:
		return err
		
	case <-time.After(10 * time.Second):
		return errors.New("timout sending email")
	}
}

// This is shamelessly copied from https://gist.github.com/chrisgillis/10888032
// A little low lowel and clunky but it does everything we need it to
// func TlsMailSmtp(servername string, auth smtp.Auth, from string, to []string, message []byte) error {
// 	// TLS config

// 	host, _, _ := net.SplitHostPort(servername)

// 	tlsconfig := &tls.Config{
// 		InsecureSkipVerify: true,
// 		ServerName:         host,
// 	}

// 	// Here is the key, you need to call tls.Dial instead of smtp.Dial
// 	// for smtp servers running on 465 that require an ssl connection
// 	// from the very beginning (no starttls)
// 	conn, err := tls.Dial("tcp", servername, tlsconfig)
// 	if err != nil {
// 		return err
// 	}

// 	c, err := smtp.NewClient(conn, host)
// 	if err != nil {
// 		return err
// 	}

// 	// Auth
// 	if err = c.Auth(auth); err != nil {
// 		return err
// 	}

// 	// To && From
// 	if err = c.Mail(from); err != nil {
// 		return err
// 	}

// 	for _, addr := range to {
// 		if err = c.Rcpt(addr); err != nil {
// 			return err
// 		}
// 	}

// 	// Data
// 	w, err := c.Data()
// 	if err != nil {
// 		return err
// 	}

// 	_, err = w.Write(message)
// 	if err != nil {
// 		return err
// 	}

// 	err = w.Close()
// 	if err != nil {
// 		return err
// 	}

// 	c.Quit()
// 	return nil
// }
