# Molecular Computation and Design Lab website

Static website for the Molecular Computation and Design Lab at IIT Gandhinagar.

## GitHub Pages

This site has no build step. In the repository settings, choose **Pages**, select **Deploy from a branch**, and publish from the `main` branch at `/ (root)`.

## Updating the site

- Edit `index.html` for homepage content.
- Edit the corresponding HTML file for each navigation page.
- Replace `IITGN_picture.jpg` or `IITGN_Logo.svg` while keeping the same filenames to update the homepage images.

### Adding an update

Add each new announcement once in `updates-data.js`. Keep the date in `YYYY-MM-DD` format and provide an ID, category, title, short tab label, source URL, and source name. Entries are sorted automatically, so their order in the file does not matter.

The homepage displays the three newest entries. `updates.html` displays the complete archive, grouped by year, with category filters generated from the data. Do not add update cards directly to either HTML page.

The IITGN campus photo and logo currently included are copies of assets served by the official IIT Gandhinagar website.
