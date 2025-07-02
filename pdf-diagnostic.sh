#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}=== PDF Generation Diagnostic Tool ===${NC}"
echo -e "This script will test the core components required for PDF generation"

# Test directory
TEST_DIR="/app/src/pdfgenerator/test"
mkdir -p $TEST_DIR
chmod 777 $TEST_DIR

# Test HTML file
HTML_FILE="$TEST_DIR/test.html"
PDF_FILE="$TEST_DIR/test.pdf"

echo -e "\n${BLUE}[1/5]${NC} Creating test HTML file..."
cat > $HTML_FILE << EOF
<!DOCTYPE html>
<html>
<head>
    <title>PDF Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #333366; }
        .content { border: 1px solid #ccc; padding: 20px; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
    </style>
</head>
<body>
    <h1>PDF Generation Test</h1>
    <div class="content">
        <p>This is a test document to verify PDF generation capabilities.</p>
        <p>Generated on: <strong>$(date)</strong></p>
        <p>If you can see this PDF, the generation process is working correctly!</p>
    </div>
    <div class="footer">
        <p>Routine Scheduler - PDF Diagnostic Tool</p>
    </div>
</body>
</html>
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Created test HTML file${NC}"
else
    echo -e "${RED}✗ Failed to create test HTML file${NC}"
    exit 1
fi

# Check for PhantomJS
echo -e "\n${BLUE}[2/5]${NC} Checking PhantomJS..."
which phantomjs > /dev/null 2>&1
if [ $? -eq 0 ]; then
    PHANTOMJS_PATH=$(which phantomjs)
    echo -e "${GREEN}✓ PhantomJS found at $PHANTOMJS_PATH${NC}"
    
    # Test PhantomJS directly
    echo -e "Testing PhantomJS version:"
    $PHANTOMJS_PATH --version
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PhantomJS works correctly${NC}"
    else
        echo -e "${RED}✗ PhantomJS fails to run${NC}"
    fi
else
    echo -e "${RED}✗ PhantomJS not found in PATH${NC}"
    exit 1
fi

# Check for html-pdf
echo -e "\n${BLUE}[3/5]${NC} Checking html-pdf module..."
if [ -d "/app/node_modules/html-pdf" ]; then
    echo -e "${GREEN}✓ html-pdf module is installed${NC}"
else
    echo -e "${RED}✗ html-pdf module is NOT installed${NC}"
    exit 1
fi

# Create test PDF generation script
echo -e "\n${BLUE}[4/5]${NC} Creating test PDF generation script..."
TEST_SCRIPT="$TEST_DIR/generate.js"

cat > $TEST_SCRIPT << EOF
const htmlPdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync('$HTML_FILE', 'utf8');

// Options for PDF generation
const options = {
  format: 'A4',
  orientation: 'portrait',
  border: '10mm',
  header: {
    height: '10mm',
    contents: '<div style="text-align: center;">PDF Test</div>'
  },
  footer: {
    height: '10mm',
    contents: {
      default: '<div style="text-align: center;"><span>{{page}}</span>/<span>{{pages}}</span></div>'
    }
  }
};

// Generate PDF
htmlPdf.create(html, options).toFile('$PDF_FILE', (err, res) => {
  if (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  } else {
    console.log('PDF successfully generated at:', res.filename);
    process.exit(0);
  }
});
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Created test generation script${NC}"
else
    echo -e "${RED}✗ Failed to create test script${NC}"
    exit 1
fi

# Run the test script
echo -e "\n${BLUE}[5/5]${NC} Testing PDF generation..."
echo -e "Running Node.js script to generate a test PDF file..."
node $TEST_SCRIPT

if [ $? -eq 0 ] && [ -f "$PDF_FILE" ]; then
    FILE_SIZE=$(stat -c%s "$PDF_FILE" 2>/dev/null)
    if [ -n "$FILE_SIZE" ] && [ $FILE_SIZE -gt 1000 ]; then
        echo -e "\n${GREEN}✓ SUCCESS! PDF was generated correctly${NC}"
        echo -e "PDF file size: $FILE_SIZE bytes"
        echo -e "PDF file location: $PDF_FILE"
        
        # Open the PDF if we're in an environment with display
        if [ -n "$DISPLAY" ]; then
            echo -e "\nAttempting to open the PDF..."
            xdg-open "$PDF_FILE" 2>/dev/null || open "$PDF_FILE" 2>/dev/null || echo "Cannot open PDF automatically. Please open manually."
        fi
    else
        echo -e "\n${RED}✗ PDF was created but the file size is suspiciously small ($FILE_SIZE bytes)${NC}"
        echo -e "This may indicate a problem with the PDF generation process."
    fi
else
    echo -e "\n${RED}✗ Failed to generate PDF${NC}"
    echo -e "Check the error messages above for more details."
fi

echo -e "\n${BLUE}=== Diagnostic Complete ===${NC}"
