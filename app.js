//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
var _=require("lodash");
const ejs = require("ejs");
//var _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

   ////create a new data base
//mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true})
mongoose.connect("mongodb+srv://admin-chaitanya0520:Chaitanya0520@cluster0.vug6bkh.mongodb.net/todolistDB",{useNewUrlParser:true})
.then(() => console.log('Yup!MongoDB Connected...'))
.catch((err) => console.log(err))
  //create schema
  const itemSchema= {
    name: String
  };
  //model
  const Item = mongoose.model("Item", itemSchema);

  //document-3
  const item1 = new Item({
    name: "Welcome To-Do List"
  });
  const item2 = new Item({
    name: "Hit + to Add a new item."
  });
  const item3 = new Item({
    name: "<= hit to Delete an item."
  });
 
 
  const defaultItems = [item1, item2, item3];
  //New schema
  const listSchema ={
    name : String,
    items: [itemSchema]
  };
  //model
  const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })
    .then(savedItem => {
      res.render("list", { listTitle: "Today", newListItems: savedItem });
    })
    .catch(err => console.log(err));


});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list; //linked to button
  
  const item = new Item({
    name: itemName
   });

   if(listName === "Today"){
     item.save();
    res.redirect("/");
   } else{
    List.findOne({name: listName })
      .then(foundlist=> {
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/" + listName);

      }) ;
   }


  
  
});


app.post("/delete", function(req,res){
  const checkedItemId = req.body.deleteItem;
  const  listName = req.body.listName;
   
  if(listName === "Today"){
     Item.findByIdAndRemove(checkedItemId)
     .then(console.log("item deleted"))
     .catch(err => console.log(err));

    res.redirect("/");

  }  else{
     List.findOneAndUpdate({name : listName }, {$pull: {items: {_id:checkedItemId }}})
       .then(res.redirect("/"+listName));
  }



  
});


app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

     List.findOne({name : customListName})
       .then(function(foundList){
           if(!foundList){
            // create a new list
            const list = new List({
            name: customListName,
             items:defaultItems
              });
              list.save();
              
              res.redirect("/" + customListName);
           } else { 
            // show existing list
            res.render("list", {listTitle : foundList.name, newListItems: foundList.items} );
           }
      });
     
     
  });

app.get("/about", function(req, res){
  res.render("about");
});

let port= process.env.PORT;
if(port== null || port==""){ port = 3000; }
app.listen(port, function(){
  console.log("Server started on port!");
});








// https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12385918#questions/19317666