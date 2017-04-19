function Injector(){

	this.funList = [];

	this.merge = function(injector){
		this.funList = this.funList.concat(injector.funList);
		return this;
	};

	this.use = function(arg){
		let fu = typeof arg == "function" ? arg : dyn => arg;
		this.funList.push(fu);
		return this;
	}

	this.add = function(child, arg){
		let fu = typeof arg == "function" ? arg : dyn => ({child: arg});
		this.funList.push(fu);
		return this;
	}

	this.inject = function(){
		let _this = this;
		return dyn => {
			let ltrl = {};
			for(let func of _this.funList){
				let result = func(dyn);
				for(let key in result){
					if(!ltrl[key]){
						ltrl[key] = result[key];
					}
				}
			}
			return ltrl;
		}
	};
}
