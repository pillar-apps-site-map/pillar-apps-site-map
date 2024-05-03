# Pillar Apps Site Map

## I.	Summary

This web-based, interactive site map was created as a visualization tool for the ongoing deployment of Wabtec’s Pillar Apps (SCC, OpsVision, Reliance, Maximo) around the world. The basemap is provided by Mapbox and the remainder of the features and interactivity were programmed using the app’s client-side JavaScript library, Mapbox GS JL. 
 
## II.	Viewing the Map
### a.	Understanding the Map

There are two main sets of data available for viewing on the map—one which contains a full listing of Wabtec’s manufacturing sites (displayed as small red dots), and another designating where each individual Pillar App is deployed (point markers, categorized by color).

Do note that the map’s data may not be comprehensive or up to date at your time of viewing—this map was created by an intern during	temporary employment, so further updates are at the discretion of Pillar App team members!

### b.	Interaction

Hover to View Site Data:	Hovering your mouse over a marker on the map will cause a pop-up to appear. This pop-up contains the following data relating to the manufacturing site located at that marker: Site Name, IT Site Code, Business Unit, Operations Leader, the main ERP used at that site, the site’s street address, and a list of all Pillar Apps that are currently deployed at that site.
Navigating:
There are a few ways to navigate around and further inspect the map. 
1)	Dragging the globe with your mouse will allow you to rotate its surface. 
2)	Scrolling with a computer mouse (or pinching/expanding with a keypad) will allow you to zoom in and out on the map. 
3)	You may also utilize the ‘+’ and ‘-’ zoom controls at the top right of the page. The arrows below these buttons will allow you to rotate the map. 
4)	Clicking on a marker will instantly take you to that location. 
5)	Utilizing the search bar and selecting a search result will send you to the location of your choosing.
   
Toggling Visibility: By selecting and de-selecting the checkboxes in the legend, renders can be toggled visible or invisible. 

## III.	Updating the Map

### a.	How to Edit

You will need to be invited to collaborate on the project’s repository to make changes to the active site. You are also welcome to clone the repository for your own use, but the map is not made to be distributed outside of Wabtec’s organization. 

Once you have access to the repository, clone a copy to your local device and make any changes necessary. Be sure to utilize proper version control when pushing changes to the repository to avoid overwriting changes made by other collaborators. 

For your updates to reflect on the Github Pages site and to avoid later issues, ensure your build has completed successfully after pushing new changes.

Mapbox GL JS Documentation: https://docs.mapbox.com/
Mapbox API Reference: https://docs.mapbox.com/mapbox-gl-js/api/

### b.	Updating Datasets

First, make all desired changes to the “pillarappdata” and/or “allsitesdata” tabs in the ‘Pillar Apps Site Map’ Excel spreadsheet (you can also find instructions on updating the project’s datasets there).

**a.	For the “pillarappdata” table:**
•	Insert a row & fill in data fields when an app has been newly deployed at a site.
•	"Pillar App," "IT Site Code," "Latitude," and "Longitude" are the minimum required fields to complete for a successful upload.
      
**b.	For the “allsitesdata” table:**
•	Insert a row & fill in data fields when a new manufacturing site has been added.
•	"IT Site Code," "Latitude," and "Longitude" are the minimum required fields to complete for a successful upload.  

**Updating Pillar Apps Deployment Data**
1)	Save a CSV copy of the ‘pillarappdata’ sheet (be sure to delete the top row of instructions) and convert the CSV file to GeoJSON data using https://geojson.io/.                                                                                                                                                    
2)	Save and title the new GeoJSON file: app_deployment.geojson.                                                                                                                                                                                                                                                                                        
3)	Then, replace the existing app_deployment.geojson file with the updated version within the project's GitHub repository found here.

**Updating Master Site Listing Data**
1)	Save a CSV copy of the ‘allsitesdata’ sheet (be sure to delete the top row of instructions) and convert the CSV file to GeoJSON data using https://geojson.io/.                                                                                                                                                                              
2)	Save and title the new GeoJSON file: master_site_listing.geojson.                                                                                                                                                                                                                                                                                    
3)	Then, replace the existing master_site_listing.geojson file with the updated version within the project's GitHub repository found here.

That's it! Allow a few minutes for the GitHub Pages site to reflect your changes.   

## IV.	Troubleshooting
V.	Tools Used
a.	Excel
b.	GeoJson.io
c.	Mapbox Studio
d.	Mapbox GL JS
e.	GitHub


