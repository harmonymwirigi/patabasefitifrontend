#!/bin/bash

# Clone Project Script for PataBaseFiti Frontend

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Banner
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  PataBaseFiti Frontend Cloning Tool${NC}"
echo -e "${GREEN}=========================================${NC}"

# Get target directory
read -p "Enter target directory name (default: patabasefiti-frontend): " TARGET_DIR
TARGET_DIR=${TARGET_DIR:-patabasefiti-frontend}

# Create directory
echo -e "\n${YELLOW}Creating project directory...${NC}"
mkdir -p "$TARGET_DIR"

# Copy all files except node_modules, .git, and dist
echo -e "${YELLOW}Copying project files...${NC}"
rsync -av --progress . "$TARGET_DIR" --exclude node_modules --exclude .git --exclude dist --exclude .next --exclude clone-project.sh

# Navigate to the new directory
cd "$TARGET_DIR" || { echo -e "${RED}Failed to navigate to $TARGET_DIR${NC}"; exit 1; }

# Initialize new git repository
echo -e "\n${YELLOW}Initializing new git repository...${NC}"
git init

# Create initial commit
git add .
git commit -m "Initial commit from PataBaseFiti template"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Success message
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}  Project successfully cloned!${NC}"
echo -e "${GREEN}  Location: $(pwd)${NC}"
echo -e "${GREEN}  Run 'npm run dev' to start the development server${NC}"
echo -e "${GREEN}=========================================${NC}"
