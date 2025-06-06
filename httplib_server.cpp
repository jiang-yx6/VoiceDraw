#include <httplib.h>
#include <iostream>
#include <string>

int main() {
    httplib::Server svr;

    // GET 请求处理
    svr.Get("/", [](const httplib::Request &, httplib::Response &res) {
        res.set_content("Hello World!", "text/plain");
    });

    // GET 带参数
    svr.Get(R"(/user/(\w+))", [](const httplib::Request& req, httplib::Response& res) {
        auto name = req.matches[1];
        res.set_content("Hello, " + name, "text/plain");
    });

    // POST 请求处理
    svr.Post("/api/data", [](const httplib::Request& req, httplib::Response& res) {
        if (req.has_header("Content-Type")) {
            if (req.get_header_value("Content-Type") == "application/json") {
                // 处理 JSON 数据
                res.set_content(req.body, "application/json");
                return;
            }
        }
        res.status = 400;
    });

    // 启动服务器
    std::cout << "Server started on port 8080..." << std::endl;
    svr.listen("0.0.0.0", 8080);
    
    return 0;
} 