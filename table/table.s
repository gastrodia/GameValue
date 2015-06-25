//var url = "http://123.56.110.174:10096/table";
var url = "http://192.168.1.25:10096/table"
var app = angular.module("latte", []);
var fileData;
app.controller("latte",["$scope", "$http", function($scope, $http) {
  var path = [];
  var root, backup;
  $scope.servers = ["192.168.1.25:10096","123.56.110.174:10086"];
  $scope.urls = ["192.168.1.25:8888","123.57.69.133:8887","121.201.8.151:8888","121.201.8.151:8788"];
  $http({
    method:"GET",
    url: url+"/all"
  }).success(function(data) {
    console.log(data);
    var now = root = data.data;
    var location = function() {
      now = root;
      path.forEach(function(p) {
        if(now[p].files) {
          now = now[p].files;
        }
      });
      $scope.tree = Object.keys(now);
    }
    $scope.treeLeft=function() {
      path.pop();
      location();
    }

    $scope.treeRight = $scope.treeClick = function(t) {
      var data = now[t];
      if(data.type == "file") {
        $http({
          method:"GET",
          url: url + "/getFileData",
           params: { path: "/"+path.join("/")+"/"+t}
        }).success(function(data) {
          $scope.heads = data.head;
          $scope.bodys = data.body;
          $scope.process = data.process;
          data.process.start = data.process.start-0;
          fileData = {
            head: $scope.heads,
            body: $scope.bodys,
            process: $scope.process
          };
          fileData.path = "/"+path.join("/")+"/"+t;
        });
      }else if(data.type == "dir"){
        now = data.files;
        path.push(t);
        $scope.tree = Object.keys(now);
      }
    }
    location();
  });
  $scope.flushFileData = function() {
    fileData.head = $scope.heads;
    fileData.body = $scope.bodys;
    fileData.process = $scope.process;
  }
  $scope.save = function() {
    if(fileData) {
      $scope.flushFileData();
      latte.require("latte_lib").xhr.post(url+"/updateData", {
        filename: fileData.path,
        fileData: JSON.stringify(fileData)
      }, { headers: {
        "Content-type": "application/x-www-form-urlencoded"
      }}, function(data) {
        console.log("上传成功",data);
      })
    }
  }
  $scope.look = function() {
    if(fileData) {
      $scope.flushFileData();
      $scope.lookShow = true;
      $scope.lookText = latte.require("latte_lib").format.jsonFormat(toJSON());
    }
  }
  $scope.set = function() {
    if(fileData) {
      $scope.flushFileData();
      $scope.setView = true;
    }
  }
  $scope.uploadServer = function() {
    if(fileData) {
      $scope.flushFileData();
      $scope.selectUrlView = true;
      $scope.selectUrlNext = function() {
        $scope.selectUrlNext = null;
        if($scope.selectUrl && $scope.selectUrl != "") {
          var opts = {};
          opts[$scope.selectVersion+"/"+$scope.process.filename] = latte.require("latte_lib").format.jsonFormat(toJSON());
          latte.require("latte_lib").xhr.post("http://"+$scope.selectUrl+"/update/data",opts, {
            headers: {
              "Content-type":"application/x-www-form-urlencoded"
            }
          }, function(data) {
            console.log(data);
          });
        }
      }
    }
  }
  $scope.updateVersion = function() {
    if($scope.selectUrl) {
      $http({
        method:"GET",
        url: "http://"+$scope.selectUrl+"/version"
      }).success(function(data) {
        $scope.selectVersion = data;
      });
    }
  }
  $scope.codesView = false;
  $scope.createCode = function() {
    $http({
      method:"GET",
      url: "http://"+$scope.codeServer+"/createCode",
      params: {
        mailId: $scope.codeMailId,
        num: $scope.codeNum
      }
    }).success(function(data) {
      $scope.codes = data.data.join("\n");
      $scope.codesView = true;
    });
    $scope.createCodeView = false;

  }
  $scope.createUser = function() {
    $http({
      method: "GET",
      url: "http://"+$scope.useUrl+"/register",
      params:{
        loginName: $scope.createUserLoginName,
        password: $scope.createUserPassword,
        type:1
      }
    }).success(function(data) {

      if(data.errorCode) {
        alert("注册失败");
      }else{
        alert("注册成功");
      }
    });
    $scope.registerView = false;
  }

  $scope.createFile = function() {
    $scope.createFileView = false;
    fileData = {
      head:[""],
      body: [],
      process: {},
      path: "/"+path.join("/")+"/"+$scope.createFileName
    };
    $scope.tree.push($scope.createFileName);
    now = root;
    path.forEach(function(p) {
      if(now[p].files) {
        now = now[p].files;
      }
    });
    now[$scope.createFileName] = {type: "file"}
    $scope.heads = fileData.head;
    $scope.bodys = fileData.body;
    $scope.process = fileData.process;

  }
  $scope.createMenuRight = function() {
    var createMenu = document.getElementById("createMenu");
    $scope.createMenuView = true;
        createMenu.style.left = event.x;
        createMenu.style.top = event.y;
  }

  $scope.fileDrop = function(event) {
    var files = event.dataTransfer.files;
    var file = files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
      var text = reader.result;
      var Buffer = latte.require("latte_lib").buffer;
      var buffer = new Buffer(text);
      latte_xlsx = latte.require("latte_lib/xlsx")
      latte_xlsx.read(buffer, function(error, xlsx) {
        console.log(xlsx);
        $scope.selectXlsxs = Object.keys(xlsx.works);
        $scope.$apply(function() {
          $scope.selectXlsx = true;
        });
        $scope.selectXlsxEvent = function(data) {
          var data = xlsx.works[$scope.selectXlsxData];
          $scope.bodys = data;
          fileData.body = $scope.bodys;
          var max = 0;
          fileData.body.forEach(function(line) {
            if(max < line.length) {
              max = line.length;
            }
          });
          if($scope.heads.length < max) {
            for(var i = $scope.heads.length ; i < max; i++) {
              $scope.heads[i] = "";
            }
          }
          $scope.selectXlsx = false;
          $scope.selectXlsxData = "";
          //$scope.selectXlsxData = null;
        }
      });

    }

    reader.onerror = function(err) {
      console.log(err);
    }
  }
  var getMail = function() {
    var mail = {
      content: $scope.mailContent,
      items: [],
      title: $scope.mailTitle,
      nickName: $scope.mailNickName
    };
    if($scope.mailMoney - 0) { mail.items.push({ itemId:"D130102" , itemNum: $scope.mailMoney - 0}); }
    if($scope.mailGold - 0) { mail.items.push({ itemId: "D130103", itemNum: $scope.mailGold - 0}); }
    if($scope.mailItemId ) { mail.items.push({itemId: $scope.mailItemId, itemNum: $scope.mailItemNum - 0 || 1});}
    return mail;
  }
  $scope.sendOneMail = function() {
    latte.require("latte_lib").xhr.get("http://"+$scope.sendUrl+"/gm/sendMail", {
      playerName: $scope.mailPlayer,
      mail: getMail()
    }, function(data) {
      console.log(data);
      $scope.mailView=false;
      $scope.$apply();
    });
  }
  $scope.sendAllMail = function() {
    $scope.confirmViewMessage='你确定是发送给全部人';
    $scope.confirmView=1;
    $scope.confirmFunc=function(){
      latte.require("latte_lib").xhr.get("http://"+$scope.sendUrl+"/gm/allSendMail", {
        playerName: $scope.mailPlayer,
        mail: getMail()
      }, function(data) {
        console.log(data);
        $scope.mailView=false;
        $scope.$apply();
      });
    };
    /**/
  }
  $scope.sendSystemMessage = function() {
    latte.require("latte_lib").xhr.get("http://"+$scope.systemMessageUrl+"/updateSystemMessage", {
      message: $scope.systemMessage
    }, function(data) {
      console.log(data);
      $scope.systeMmessageView=false;
    });
  }
}]);


app.directive('myRight', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightclick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.directive("myDrag", function($parse) {
  return function(scope, element, attrs) {

    element.bind("dragenter", function(event) {
      var fn = $parse(attrs.ngDragenter);
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
    element.bind("dragover", function(event) {
      var fn = $parse(attrs.ngDragover);
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
    element.bind("drop", function(event) {
      var fn = $parse(attrs.ngDrop);
      //var filesFn = $parse(attrs.ngFiles);
      scope.$apply(function() {
        event.stopPropagation();
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
  }
});
