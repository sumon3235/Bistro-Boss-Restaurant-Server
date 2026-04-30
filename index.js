const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
module.exports = app;
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bistrobossretaurent.web.app",
      "https://bistrobossretaurent.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Mongodb api
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5jgflna.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const menuCollection = client.db("bistro-boss-db").collection("menu");
    const reviewCollection = client.db("bistro-boss-db").collection("reviews");
    const cartCollection = client.db("bistro-boss-db").collection("cart");
    const userCollection = client.db("bistro-boss-db").collection("user");
    const paymentCollection = client.db("bistro-boss-db").collection("payment");

    // Json Web Token Related Api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // MiddleWare Funtion
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // verify a admin funtion
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // Get Route For All Menu
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // Post Route For Menu
    app.post("/menu", verifyToken, verifyAdmin, async (req, res) => {
      const item = req.body;
      const result = await menuCollection.insertOne(item);
      res.send(result);
    });

    // menu routes
    // GET single menu item by id
    app.get("/menu/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await menuCollection.findOne(query);
      res.send(result);
    });

    // PUT — update menu item (admin only)
    app.put("/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          name: item.name,
          category: item.category,
          price: item.price,
          recipe: item.recipe,
          image: item.image,
        },
      };
      const result = await menuCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // DELETE — delete menu item (admin only)
    app.delete("/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await menuCollection.deleteOne(query);
      res.send(result);
    });

    // Get Route For All Review
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // Get Route For Cart Section
    app.get("/carts", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // admin route
    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // Post Route For Cart Section (authenticated user)
    app.post("/carts", verifyToken, async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    // Delete an item from the cart (authenticated user)
    app.delete("/carts/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const cartItem = await cartCollection.findOne(filter);
      if (!cartItem) {
        return res.status(404).send({ message: "Cart item not found" });
      }
      if (cartItem.email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await cartCollection.deleteOne(filter);
      res.send(result);
    });

    // User Data Start
    // Get Route For User
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // Post Route For User
    app.post("/users", async (req, res) => {
      const user = req.body;
      if (!user || !user.email) {
        return res.status(400).send({ message: "Invalid user data" });
      }
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Update user role using PATCH method (admin only)
    app.patch("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Delete Route For User (admin only)
    app.delete("/user/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    // Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // post route for payment
    app.post("/payments", async (req, res) => {
      try {
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment);

        // Query to clear cart
        const query = {
          _id: {
            $in: payment.cartIds.map((id) => new ObjectId(id)),
          },
        };
        const deleteResults = await cartCollection.deleteMany(query);

        res.send({ result, deleteResults });
      } catch (error) {
        console.error("Payment Save Error:", error);
        res.status(500).send({ error: "Something went wrong" });
      }
    });

    // // get payment history by user email
    app.get("/payment/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // stats and analysis for admin
    app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
      const user = await userCollection.estimatedDocumentCount();
      const menu = await menuCollection.estimatedDocumentCount();
      const orders = await cartCollection.estimatedDocumentCount();
      const result = await paymentCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalReveneu: { $sum: "$price" },
            },
          },
        ])
        .toArray();
      const reveneu = result.length > 0 ? result[0].totalReveneu : 0;

      res.send({
        user,
        menu,
        orders,
        reveneu,
      });
    });

    // stats and analysis for user
    app.get("/user-stats", verifyToken, async (req, res) => {
      try {
        const email = req.query.email;
        

        const payments = await paymentCollection.countDocuments({ email });
        const reviews = await reviewCollection.countDocuments({ email });
        
    
        const bookings = await cartCollection.countDocuments({ email });

        res.send({
          orders: payments, 
          reviews,
          bookings,
          payments: payments,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).send({ error: "Failed to load user stats" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!",
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bistro Boss Server Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;