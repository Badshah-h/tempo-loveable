echo "Initializing Git repository..."
git init
echo "Adding README.md to staging..."
git add README.md
echo "Committing changes..."
git commit -m "first commit"
echo "Creating main branch..."
git branch -M main
echo "Adding remote repository..."
git remote add origin https://github.com/Badshah-h/loveable-lara-chat.git
echo "Pushing to remote repository..."
git push -u origin main
echo "Done!"
