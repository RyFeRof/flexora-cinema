package repository

import (
	"context"
	"fullstack/db"
	"fullstack/models"
)

func ChangeLogin(ctx context.Context, req models.ChangeRequest) error {
	_, err := db.DB.Exec(ctx, `UPDATE users SET login=$1 WHERE id=$2`, req.Input, req.Id)
	return err
}
func ChangeMail(ctx context.Context, req models.ChangeRequest) error {
	_, err := db.DB.Exec(ctx, `UPDATE users SET mail=$1 WHERE id=$2`, req.Input, req.Id)
	return err
}
func ChangePhoneNumber(ctx context.Context, req models.ChangeRequest) error {
	_, err := db.DB.Exec(ctx, `UPDATE users SET phoneNumber=$1 WHERE id=$2`, req.Input, req.Id)
	return err
}
func ChangeName(ctx context.Context, req models.ChangeRequest) error {
	_, err := db.DB.Exec(ctx, `UPDATE users SET name=$1 WHERE id=$2`, req.Input, req.Id)
	return err
}
