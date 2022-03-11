## Quick start

The dependencies for this project are [.NET Core 5](https://dotnet.microsoft.com/en-us/download/dotnet/5.0), [Node.js](https://nodejs.org/en/download/), [Angular 13](https://angular.io/), [Ionic Framework](https://ionicframework.com/), [Capacitor](https://capacitorjs.com/) and [Cordova](https://cordova.apache.org/).

You will need the latest Node 16 LTS and NPM 8 installed.

Make sure you have [node installed and running](https://nodejs.org/en/download/), then install Angular,Ionic and Cordova globally using npm.

```node
npm install -g @angular/cli
npm install -g ionic@latest cordova@latest
```

Clone the repo, install the npm packages

```node
git clone https://github.com/heapofcode/blog.git
```

# Server
```node
cd blog/server
dotnet ef migrations add initial
dotnet ef migrations update
```

# Client
```node
cd blog/client
npm install
```


## Start Server
To start the server, go to the server folder and open app.sln. Then run as IIS Express.

## Start Client
```node
cd blog/client
code .
ng serve -o
```

## How it works
You can download build Android and Windwos app from [dropmefiles](https://dropmefiles.com/SGuhW) or see live Web on http://212.98.191.79:3030
