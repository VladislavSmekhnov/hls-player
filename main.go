package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize the Gin router
	router := gin.Default()

	router.Static("/", "./")

	// Start the server on port 5500
	router.Run(":5500")
}
