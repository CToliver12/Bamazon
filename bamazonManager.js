//required node modules 
var mysql = require("mysql");
var inquirer = require("inquirer");

//connects to the database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Kayemy#1",
	database: "Bamazon_db"
});//end of connection 

// if connection doesn't work, throws error, 
connection.connect(function(err) {
	if (err) throw err;

	//Lets manager pick action 
	selectAction();

});//end of error 

var selectAction = function(){
	inquirer.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'What would you like to do?',
		choices: [
					"View Products for Sale",
					"View Low Inventory",
					"Add to Inventory",
					"Add New Product"
				]
			}//end of inquirer.prompt
	]).then(function(answer){
		//Different functions called based on managers selection
		switch(answer.action){
			case "View Products for Sale":
				viewProducts();
				break;

			case "View Low Inventory":
				viewLowInventory();
				break;

			case "Add to Inventory":
				addInventory();
				break;

			case "Add New Product":
				addProduct();
				break;
		}

	});//end of.then
};//end of selectAction function 

 var viewProducts = function(){
 	var query = "Select * FROM products";
	connection.query(query, function(err, res){
		console.log('Welcome to THE BAMAZON Store!!');
		console.log("==============================");
		if (err) throw err;
		for (var i = 0; i < res.length; i++){
				console.log("Product ID: " + res[i].item_id + " || Product Name: " +
											res[i].product_name + " || Price: " + res[i].price);
		}//end of loop
            //Lest manager select new action 
          selectAction(); 
        });
};

//Displays products with low inventory
var viewLowInventory = function(){
	var query = "Select item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5";
	connection.query(query, function (err, res) {
		if (err) throw err;
		for(var i = 0; i < res.length; i++){
			console.log("Product ID: " + res[i].item_id + "|| Product Name: " + res[i].product_name + "|| Quantity: " + res[i].stock_quantity);
		}//end of loop

		//Lets manager select new action 
		selectAction();
	}); //end of connection
};//end of function 
