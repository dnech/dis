var api = {
    create: function(params, callback, sessionID, request, response){
        //@params p1 p2 p3 p4 
		//@meta table table2 table3
		callback({
            success:true,
            data:{
                firstname:'John',
                lastname: 'Smith',
                email: 'john.smith@comapny.info'
            },
			params: params
        });
    },

    read: function(params, callback, sessionID, request, response){
        //@meta table
		callback({
            success:true,
            data:{
                firstname:'John',
                lastname: 'Smith',
                email: 'john.smith@comapny.info'
            }
        });
    },

    update: function(params, callback, sessionID, request, response){
        //@meta table
		callback({
            success:true,
            data:{
                firstname:'John',
                lastname: 'Smith',
                email: 'john.smith@comapny.info'
            }
        });
    },

    destroy: function(params, callback, sessionID, request, response){
        //@meta table
		callback({
            success: false,
            msg: "Upload failed - empty file",
            params: params,
            errors: {
                clientCode: "File not found",
                portOfLoading: "This field must not be null"
            }
        });
    }
};

module.exports = api;