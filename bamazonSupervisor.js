//Supervisors can view product sales for each department  
//THey can also add new departments  

//Modules required 
var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table");

//Database connection 
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Kayemy#1", 
	database: "Bamazon_db"
}); //end of connection 

//If connection doesn't work, throws error, else...
connection.connect(function(err) {
	if (err) throw err;

	//Lets supervisor pick action.
	selectAction();
});// end of connection error  

//Supervisor selects to view product sales or create department 
var selectAction = function(){
	inquirer.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'What would you like to do?',
		choices: [
				"View Product Sales by Department", 
				"Create New Department"
		]
	}
	]).then(function(answer) {

		//Functions called based on supervisors selection 
		switch(answer.action){
			case "View Product Sales by Department": 
					viewDepartmentSales();
					break;

			case "Create New Department":
					createDepartment();
					break;
		}// end of switch statements  
	});//end of .then function 
};// end of selectAction function 

//Supervisor views product sales by department 
//The total profit is calculated based on total sales minus overhead costs 
//Total profit added to table using aliases
var viewDepartmentSales = function() {
	var query = "Select department_id As department_id, department_name AS department_name," +
				"over_head_costs AS over_head_costs, total_sales AS total_sales," +
				"(total_sales - over_head_costs) AS total_profit FROM departments";
	connection.query(query, function(err, res){

		if (err) throw err;


		//Product sales displayed in table in console 
		console.table(res);
		selectAction();

	});			
};

//Supervisor creates new department 
var createDepartment = function() {
				inquirer.prompt([{
					name: "department_name",
					type: "input",
					message: "What is the new department name?"
				}, {
					name: "over_head_costs",
					type: "input",
					message: "What are the overhead costs for this department?"
				
				}]).then(function(answer){

				//Department added to departments database
				connection.query("INSERT INTO departments SET ?", {
					department_name: answer.department_name,
					over_head_costs: answer.over_head_costs
				}, function(err, res) {
					if(err){
						throw err;
					} else {
						console.log("Your department was added successfully!");
						selectAction();
					}
				});

			});
};

