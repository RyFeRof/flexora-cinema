package gemini

import (
	"context"
	"fmt"

	"google.golang.org/genai"
)

var client *genai.Client

func Init(ctx context.Context, apiKey string) error {
	var err error
	client, err = genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return err
	}
	return nil
}
func GetEmbedding(ctx context.Context, text string) ([]float32, error) {
	if client == nil {
		return nil, fmt.Errorf("gemini client не инициализирован")
	}
	result, err := client.Models.EmbedContent(ctx, "gemini-embedding-001", genai.Text(text), nil)
	if err != nil {
		return nil, err
	}
	if len(result.Embeddings) == 0 {
		return nil, fmt.Errorf("gemini не вернул embedding для текста")
	}
	return result.Embeddings[0].Values, nil
}
