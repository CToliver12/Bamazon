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
											res[i].product_name + " || Price: " + res[i].price + " || Quantity: " + res[i].stock_quantity);
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

//Adds new stock to selected product.
var addInventory = function() {

		inquirer.prompt([
				{
						name:"product_ID",
						type: "input",
						message: "Enter product ID that your would like to add stock to."
				},
				{
					name: "stock",
					type: "input",
					message: "How much stock would you like to add?"
				}
		
		]).then(function(answer){

				//Pushes new stock to database.
				connection.query("SELECT * FROM products", function(err,results) {

					var chosenItem;

					//Gets product who's stock needs to be updated.
					for(var i = 0; i < results.length; i++){
						if(results[i].item_id === parseInt(answer.product_ID)){
								chosenItem = results[i];
						}
					}

					//Adds new stock to existing stock.
					var updatedStock = parseInt(chosenItem.stock_quantity) + parseInt(answer.stock);
								console.log("Updated stock: " + updatedStock);


					//Updates stock for selected product in database 
					connection.query("UPDATE products SET ? WHERE ?", [{
						stock_quantity: updatedStock
					}, {
						item_id: answer.product_ID
					}], function (err,res){
						if(err) {
								throw err;
						} else {
							//Lets manager select new action 
							selectAction();
						}//end of else statement
					}); //end of function (err,res)

				});//end of connection query
			}); //end of .then 
		};// end of addinventory 

//Adds new product to database 
var addProduct = function(){
	inquirer.prompt([{
		name: "product_name",
		type: "input",
		message: "What is the product you would like to add?"
	}, {
		name: "department_name",
		type: "input",
		message: "What is the the department for this product?"
	},{
		name: "price",
		type: "input",
		message: "What is the price for the product, e.g. 32.00?"
	}, {
		name: "stock_quantity",
		type: "input",
		message: "How much stock do you have to start with?"
	
	}]).then(function(answer){
		connection.query("INSERT INTO products SET ?", {
			product_name: answer.product_name,
			department_name: answer.department_name,
			price: answer.price,
			stock_quantity: answer.stock_quantity
		}, function(err, res){
		if(err){
			throw err;
		} else {
			console.log("Your product was added successfully!");

				//Checks if department exists 
				checkIfDepartmentExists(answer.department_name);
			}
		});
	});
};
//Checks if department exists 
var checkIfDepartmentExists = function(departmentName) {
	var query = "Select department_name FROM departments";
	connection.query(query, function(err, res){
		if (err) throw err;

		//If department already exists, no need to add it 
		for(var i = 0; i <res.length; i++) {
			if (departmentName === res[i].department_name){
				console.log("This department already exists so no need to add it: " + departmentName);
				selectAction();
			}	
		}
		// If department doesn't exist, adds new department 
		addNewDepartment(departmentName);
	});
};

//Adds new department
//Nice feature to let both managers and supervisors add departments 
var addNewDepartment = function(departmentName) {
	console.log('We will add this new department: ' + departmentName);

	//Adds department to departments table in database
	connection.query("INSERT INTO departments SET ?", {
					department_name: departmentName
				}, function(err, res) {
					if(err) {
						throw err;
					} else {
						console.log("New department was added successfully!");
						selectAction();
					}
				});
};		