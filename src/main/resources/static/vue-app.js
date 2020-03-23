var stompClient = null;
const handlers = [];

var stompTaskClient = null;
const taskHandlers = [];

function addHandler(handler){
    handlers.push(handler);
}
function addTaskHandler(handler){
    taskHandlers.push(handler)
}

var app = new Vue({
    el: '#app',
    data: {
        connected: false,
        message: '',
        messages: []
    },
    methods: {
        connect: function(){
            console.log("Connection...")
            var socket = new SockJS('/gs-guide-websocket');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/greetings', function (greeting) {
                    handlers.forEach( function(handler){
                        handler(JSON.parse(greeting.body).content)
                    })
                });
            });
            this.connected = true;
        },
        disconnect: function(){
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
            this.connected = false;
        },
        sendMessage: function(){
            stompClient.send("/app/hello", {}, JSON.stringify({'name': this.message}));
        },
        test: function(){
            console.log("test")
        }
    },
    created(){
        //Добавляем метод прослушивания в слушателей
        addHandler(message => {
            console.log(message);
            this.messages.push(message)
        })
    }
});

var tasksApp = new Vue({
    el: '#task-app',
    data: {
        greeting:'You have a couple of things to do...',
        task:'',
        tasks:[]
    },
    methods:{
        addTask: function(){
            stompTaskClient.send("/app/task", {}, JSON.stringify(this.task));// отправляем сообщение через stompClient на сервер по пути
        },
    },

    created(){
        var socket = new SockJS('/gs-guide-websocket');
        stompTaskClient = Stomp.over(socket);
        stompTaskClient.connect({}, frame => {
            stompTaskClient.subscribe('/topic/tasks', task =>{ //Подключаем приложение на прослушивание запросов из адреса /topic/tasks
                this.tasks.push(task.body) // Добавляем тело ответа в список задач.
            });
        });
    }
})

