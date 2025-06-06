#include <nlohmann/json.hpp>
#include <httplib.h>
#include <iostream>
#include <string>
#include <map>
#include <vector>

using json = nlohmann::json;
using namespace std;

// 用户数据结构
struct User {
    int id;
    string name;
    string email;
    
    // 转换为JSON
    json to_json() const {
        return {
            {"id", id},
            {"name", name},
            {"email", email}
        };
    }
    
    // 从JSON转换
    static User from_json(const json& j) {
        User user;
        user.id = j["id"];
        user.name = j["name"];
        user.email = j["email"];
        return user;
    }
};

// 模拟数据库
class UserDB {
private:
    map<int, User> users;
    int next_id = 1;

public:
    // 添加用户
    User add_user(const string& name, const string& email) {
        User user{next_id++, name, email};
        users[user.id] = user;
        return user;
    }

    // 获取所有用户
    vector<User> get_all_users() {
        vector<User> result;
        for (const auto& [_, user] : users) {
            result.push_back(user);
        }
        return result;
    }

    // 获取单个用户
    optional<User> get_user(int id) {
        auto it = users.find(id);
        if (it != users.end()) {
            return it->second;
        }
        return nullopt;
    }

    // 更新用户
    bool update_user(int id, const string& name, const string& email) {
        auto it = users.find(id);
        if (it != users.end()) {
            it->second.name = name;
            it->second.email = email;
            return true;
        }
        return false;
    }

    // 删除用户
    bool delete_user(int id) {
        return users.erase(id) > 0;
    }
};

int main() {
    UserDB db;
    httplib::Server svr;

    // 添加一些测试数据
    db.add_user("张三", "zhangsan@example.com");
    db.add_user("李四", "lisi@example.com");

    // GET /users - 获取所有用户
    svr.Get("/users", [&db](const httplib::Request&, httplib::Response& res) {
        json response = json::array();
        for (const auto& user : db.get_all_users()) {
            response.push_back(user.to_json());
        }
        res.set_content(response.dump(), "application/json");
    });

    // GET /users/:id - 获取单个用户
    svr.Get(R"(/users/(\d+))", [&db](const httplib::Request& req, httplib::Response& res) {
        int id = stoi(req.matches[1]);
        auto user = db.get_user(id);
        
        if (user) {
            res.set_content(user->to_json().dump(), "application/json");
        } else {
            res.status = 404;
            json error = {{"error", "用户不存在"}};
            res.set_content(error.dump(), "application/json");
        }
    });

    // POST /users - 创建新用户
    svr.Post("/users", [&db](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            string name = j["name"];
            string email = j["email"];
            
            auto user = db.add_user(name, email);
            res.set_content(user.to_json().dump(), "application/json");
        } catch (const exception& e) {
            res.status = 400;
            json error = {{"error", "无效的请求数据"}};
            res.set_content(error.dump(), "application/json");
        }
    });

    // PUT /users/:id - 更新用户
    svr.Put(R"(/users/(\d+))", [&db](const httplib::Request& req, httplib::Response& res) {
        try {
            int id = stoi(req.matches[1]);
            auto j = json::parse(req.body);
            
            if (db.update_user(id, j["name"], j["email"])) {
                auto user = db.get_user(id);
                res.set_content(user->to_json().dump(), "application/json");
            } else {
                res.status = 404;
                json error = {{"error", "用户不存在"}};
                res.set_content(error.dump(), "application/json");
            }
        } catch (const exception& e) {
            res.status = 400;
            json error = {{"error", "无效的请求数据"}};
            res.set_content(error.dump(), "application/json");
        }
    });

    // DELETE /users/:id - 删除用户
    svr.Delete(R"(/users/(\d+))", [&db](const httplib::Request& req, httplib::Response& res) {
        int id = stoi(req.matches[1]);
        
        if (db.delete_user(id)) {
            json response = {{"message", "用户已删除"}};
            res.set_content(response.dump(), "application/json");
        } else {
            res.status = 404;
            json error = {{"error", "用户不存在"}};
            res.set_content(error.dump(), "application/json");
        }
    });

    // 错误处理中间件
    svr.set_exception_handler([](const auto& req, auto& res, std::exception_ptr ep) {
        res.status = 500;
        json error = {{"error", "服务器内部错误"}};
        res.set_content(error.dump(), "application/json");
    });

    // 启动服务器
    cout << "服务器启动在 http://localhost:8080" << endl;
    svr.listen("localhost", 8080);

    return 0;
} 