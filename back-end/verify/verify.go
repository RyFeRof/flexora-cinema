package verify

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v4"
)

var client *resend.Client

func Init() {
	client = resend.NewClient(os.Getenv("RESEND_API_KEY"))
}

func Send(to, subject, html string) error {
	from := os.Getenv("EMAIL_FROM")
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}
	_, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("resend: %w", err)
	}
	return nil
}
