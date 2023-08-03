const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer for file upload
const upload = multer({ dest: 'public/images/' }); // Set the destination folder for uploaded images

const app = express();
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
const products = data.products;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
       res.send("<h1>Welcome to home page<h1>");
       // res.render('products', { prods: products, pageTitle: 'mytitle' });
});

app.get('/products', (req, res) => {

       res.send(products);
});

app.get('/admin', (req, res) => {

       res.render('admin', { products: products, pageTitle: 'mytitle' });
       // res.send(products);
});
app.get('/product/:id', (req, res) => {
       if (req.params) {
              const id = +req.params.id;

              const product = products.find(p => p.id === id);
              if (product) {

                     res.render('product', { product: product });
              }
              else {

                     res.send("Invalid Request").status(400);
              }
       }
});

// Create API
app.post('/products', async (req, res) => {
       
       res.json("Done")

})
app.get('/add-product', (req, res) => {
       res.render('addproduct');
});
app.post('/add-product', upload.single('image'), (req, res) => {
       const data = req.body;
     
       // Get the last product's ID, if available
       const lastProduct = products.length > 0 ? products[products.length - 1] : null;
       const lastProductId = lastProduct ? parseInt(lastProduct.id, 10) : 0;
     
       // Generate the new product's ID by incrementing the last product's ID by 1
       const newProductId = lastProductId + 1;
     
       const newProduct = {
         id: newProductId, // Convert the new ID to a string
         title: data.title,
         description: data.description,
         url: data.url,
       };
     
       // Check if there is an uploaded image
       if (req.file) {
         // Generate a unique filename for the image based on the current time
         const timestamp = Date.now();
         const filename = `${timestamp}-${req.file.originalname}`;
     
         // Assuming the image is stored in the "public/images" folder, use the following path to store in data.json
         newProduct.images = [`/images/${filename}`];
     
         // Move the uploaded image to the "public/images" folder with the unique filename
         const imageFilePath = path.join(__dirname, 'public', 'images', filename);
         fs.renameSync(req.file.path, imageFilePath);
       } else {
         // If no image is uploaded, set the images property as an empty array
         newProduct.images = [];
       }
     
       products.push(newProduct);
       fs.writeFileSync('data.json', JSON.stringify({ products: products }, null, 2));
     
       res.json({ message: 'Product added successfully.' });
     });
     
     
// Add a route to handle the edit form
app.get('/edit', (req, res) => {
       const productId = +req.query.id;
       const product = products.find(p => p.id === productId);

       if (product) {
              res.render('editform', { product: product });
       } else {
              res.status(404).send('Product not found.');
       }
});

app.post('/product/:id', upload.single('image'), (req, res) => {
       if (req.params.id) {
         const id = +req.params.id;
         const productIndex = products.findIndex(p => p.id === id);
     
         if (productIndex !== -1) {
           // Create a copy of the product to update
           const updatedProduct = { ...products[productIndex] };
              console.log(req.body.title);
           // Update only the fields that have changed from the form
           if (req.body.title) {
             updatedProduct.title = req.body.title;
           }
           if (req.body.description) {
             updatedProduct.description = req.body.description;
           }
           if (req.body.url) {
             updatedProduct.url = req.body.url;
           }
     
           // Check if there is an uploaded image
           if (req.file) {
              const fileExt = path.extname(req.file.originalname);
              const uniqueFileName = `${Date.now()}${fileExt}`;
              const imagePath = path.join(__dirname, 'public/images', uniqueFileName);
      
              // Move the uploaded file to the specified path with the unique filename
              fs.renameSync(req.file.path, imagePath);
      
              // Add the image path to the updated product
              updatedProduct.images = [`/images/${uniqueFileName}`];
            }
     
           // Update the product in the products array
           products[productIndex] = updatedProduct;
     
           // Save the updated data to data.json
           fs.writeFileSync('data.json', JSON.stringify({ products: products }, null, 2));
     
           res.status(202).json({ message: 'Product updated successfully.' });
         } else {
           res.status(404).json({ error: 'Product not found.' });
         }
       } else {
         res.status(400).json({ error: 'Invalid request.' });
       }
     });



app.delete('/product/:id', (req, res) => {
       if (req.params.id) {
              const id = +req.params.id;
              const productIndex = products.findIndex(p => p.id === id);

              if (productIndex !== -1) {
                     products.splice(productIndex, 1);
                     fs.writeFileSync('data.json', JSON.stringify({ products: products }, null, 2));

                     res.status(200).json({ message: 'Product deleted successfully.' });
              } else {
                     res.status(404).json({ error: 'Product not found.' });
              }
       } else {
              res.status(400).json({ error: 'Invalid request.' });
       }
});

app.listen(5000);