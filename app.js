import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
const app=express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
import dns from 'node:dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

mongoose.connect(process.env.MONGO_URI);

const itemSchema= new mongoose.Schema({
    name:String
})

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
        name:"Morning walk"
    });
    const item2=new Item({
        name:"tea"
    });
    const item3=new Item({
        name:"money"
    });
    const defaultItem=[item1,item2,item3];

    const listSchema= new mongoose.Schema({
        name:String,
        items:[itemSchema]
    })

    let day=new Date();
    let options={
        weekday: "long",
        day:"numeric",
        month:"long"
    };
    let today=day.toLocaleDateString("en-us",options);


    const List=mongoose.model("List",listSchema);

    app.get("/", function(req, res) {
    res.redirect("/today");
    });


    app.get("/:route",async function(req,res){
        let routeName=req.params.route;
        if(routeName=="today"){
            const count =await Item.countDocuments();

            if(count==0){
            await Item.insertMany(defaultItem);
            res.redirect("/");
            return;
            }
            const result = await Item.find();
            return res.render("todo", { day: today, result: result });
        }
        try{
        const foundList= await List.findOne({name:routeName});
        if(!foundList){
                let listItem=new List({
                    name:routeName,
                    items:defaultItem
                })
                await listItem.save();
                res.redirect("/"+routeName);
        }
        else{
             res.render("todo",{day:routeName,result:foundList.items});
        }
        }
        catch(err){
            console.log(err);
        }
    })



 app.post("/", async function(req,res){
    let listName=req.body.list;
    let listItem=req.body.newitem;

   if(listName===today){

    const insert = new Item({name:listItem})
    await insert.save();
    res.redirect("/today");
   }
   else{
   
    let result=await List.findOneAndUpdate(
        {name:listName},
        {$push :{items :{name:listItem}}}
    )
    res.redirect("/"+listName);
   }
 });
app.post("/delete", async function(req,res){
    let listName=req.body.list;
    let id=req.body.id;
    if(listName===today){
    await Item.findByIdAndDelete(id);
    res.redirect("/today");
    }
    else{
        await List.findOneAndUpdate(
            {name:listName},
            {$pull :{items :{_id:id}}}
        )
        res.redirect("/"+listName);
    }
});
app.listen(3000,function(){
    console.log("server started on port 3000.");
});