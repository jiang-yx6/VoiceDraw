#include "crow.h"

int main() {
    crow::SimpleApp app;

    // GET请求处理
    CROW_ROUTE(app, "/")([]() {
        return "Hello World!";
    });

    // GET请求带参数
    CROW_ROUTE(app, "/user/<string>")([](string name) {
        return "Hello " + name;
    });

    // POST请求处理
    CROW_ROUTE(app, "/api/data").methods("POST"_method)
    ([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400);
        
        return crow::response{x};
    });

    // 启动服务器
    app.port(8080).multithreaded().run();
    return 0;
} 