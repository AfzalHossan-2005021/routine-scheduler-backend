#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}=== Routine Scheduler PDF Setup Script ===${NC}"

# PDF Directory Setup
echo -e "\n${BLUE}[1/6]${NC} Setting up PDF directories..."
mkdir -p /app/src/pdfgenerator
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Created directory /app/src/pdfgenerator${NC}"
else
    echo -e "${RED}✗ Failed to create directory /app/src/pdfgenerator${NC}"
    # Try with sudo if normal creation fails
    echo "Attempting with elevated permissions..."
    sudo mkdir -p /app/src/pdfgenerator
fi

# Ensure proper permissions
echo -e "\n${BLUE}[2/6]${NC} Setting directory permissions..."
chmod -R 777 /app/src/pdfgenerator
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Set permissions to 777 for /app/src/pdfgenerator${NC}"
else
    echo -e "${RED}✗ Failed to set permissions${NC}"
fi

# Create a test file to verify write access
echo -e "\n${BLUE}[3/6]${NC} Verifying write access..."
echo "Test file $(date)" > /app/src/pdfgenerator/test.txt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully wrote test file${NC}"
else
    echo -e "${RED}✗ Failed to write test file${NC}"
    echo "Check ownership and permissions for the directory"
fi

# Check if phantomjs is available
echo -e "\n${BLUE}[4/6]${NC} Checking PhantomJS installation..."
which phantomjs
if [ $? -eq 0 ]; then
    PHANTOMJS_PATH=$(which phantomjs)
    echo -e "${GREEN}✓ PhantomJS is available at ${PHANTOMJS_PATH}${NC}"
    
    # Create symlink to the expected path
    EXPECTED_PATH="/app/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs"
    mkdir -p $(dirname "$EXPECTED_PATH")
    
    # Check if the expected path already exists
    if [ -f "$EXPECTED_PATH" ]; then
        echo "Expected path already exists, checking if it works..."
        "$EXPECTED_PATH" --version
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}! PhantomJS at expected path doesn't work, creating symlink...${NC}"
            ln -sf "$PHANTOMJS_PATH" "$EXPECTED_PATH"
        else
            echo -e "${GREEN}✓ PhantomJS at expected path works correctly${NC}"
        fi
    else
        echo "Creating symlink to ensure PhantomJS is available at expected path..."
        ln -sf "$PHANTOMJS_PATH" "$EXPECTED_PATH"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Created symlink to ${EXPECTED_PATH}${NC}"
        else
            echo -e "${RED}✗ Failed to create symlink${NC}"
        fi
    fi
else
    echo -e "${RED}✗ PhantomJS is NOT available in PATH${NC}"
    echo "Searching for PhantomJS installation..."
    PHANTOMJS_FOUND=$(find / -name phantomjs -type f 2>/dev/null | head -n 1)
    
    if [ -n "$PHANTOMJS_FOUND" ]; then
        echo -e "${YELLOW}! Found PhantomJS at ${PHANTOMJS_FOUND}${NC}"
        echo "Creating symlink to /usr/local/bin/phantomjs..."
        ln -sf "$PHANTOMJS_FOUND" /usr/local/bin/phantomjs
        
        # Also symlink to the expected path
        EXPECTED_PATH="/app/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs"
        mkdir -p $(dirname "$EXPECTED_PATH")
        ln -sf "$PHANTOMJS_FOUND" "$EXPECTED_PATH"
        
        echo -e "${GREEN}✓ PhantomJS symlinks created${NC}"
    else
        echo -e "${RED}✗ PhantomJS not found on system. Installing...${NC}"
        npm install phantomjs-prebuilt --save
    fi
fi

# Check if html-pdf module exists
echo -e "\n${BLUE}[5/6]${NC} Checking HTML-PDF module..."
if [ -d "/app/node_modules/html-pdf" ]; then
    echo -e "${GREEN}✓ html-pdf module is installed${NC}"
else
    echo -e "${YELLOW}! html-pdf module is NOT installed. Installing now...${NC}"
    npm install html-pdf phantomjs-prebuilt --save
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully installed required modules${NC}"
    else
        echo -e "${RED}✗ Failed to install modules${NC}"
    fi
fi

# Optional: Clean old PDFs
echo -e "\n${BLUE}[6/6]${NC} Managing existing PDFs..."
# Uncomment the next line to clean all existing PDFs
# find /app/src/pdfgenerator -name "*.pdf" -type f -delete

# Count existing PDFs
PDF_COUNT=$(find /app/src/pdfgenerator -name "*.pdf" -type f | wc -l)
if [ "$PDF_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}! Found ${PDF_COUNT} existing PDF files in the directory${NC}"
    echo "To remove old PDFs, uncomment the cleanup line in this script"
else
    echo -e "${GREEN}✓ No existing PDFs found${NC}"
fi

# Verify the entire setup
echo -e "\n${BLUE}=== Verification Results ===${NC}"
ERRORS=0

# Check directory
if [ -d "/app/src/pdfgenerator" ]; then
    echo -e "${GREEN}✓ PDF directory exists${NC}"
else
    echo -e "${RED}✗ PDF directory is missing${NC}"
    ((ERRORS++))
fi

# Check permissions
PERMS=$(stat -c "%a" /app/src/pdfgenerator 2>/dev/null)
if [[ "$PERMS" == "777" ]]; then
    echo -e "${GREEN}✓ Directory permissions are correct${NC}"
else
    echo -e "${RED}✗ Directory permissions are incorrect: ${PERMS}${NC}"
    ((ERRORS++))
fi

# Check PhantomJS
which phantomjs > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PhantomJS is in PATH${NC}"
else
    echo -e "${RED}✗ PhantomJS is missing from PATH${NC}"
    ((ERRORS++))
fi

# Check html-pdf module
if [ -d "/app/node_modules/html-pdf" ]; then
    echo -e "${GREEN}✓ html-pdf module is available${NC}"
else
    echo -e "${RED}✗ html-pdf module is missing${NC}"
    ((ERRORS++))
fi

# Final result
if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All checks passed! PDF environment is ready.${NC}"
else
    echo -e "\n${RED}✗ Found ${ERRORS} issues that may affect PDF generation.${NC}"
    echo "Please check the logs above and address any issues."
fi
