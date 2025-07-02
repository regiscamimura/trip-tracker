#!/bin/bash

echo "🚀 Formatting and linting Python code..."

echo "🧹 Removing unused imports..."
autoflake --in-place --remove-all-unused-imports --recursive .

echo "📝 Sorting imports..."
isort .

echo "🎨 Formatting code..."
black .

echo "🔧 Additional formatting..."
autopep8 --in-place --aggressive --aggressive .

echo "🔍 Checking code..."
flake8 .

echo "✅ Done!" 