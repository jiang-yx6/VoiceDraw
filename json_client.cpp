#include <nlohmann/json.hpp>
#include <httplib.h>
#include <iostream>
#include <string>

using json = nlohmann::json;
using namespace std;

void print_response(const httplib::Result& res) {
    if (res) {
        cout << "状态码: " << res->status << endl;
        if (!res->body.empty()) {
            // 美化输出JSON
            auto j = json::parse(res->body);
            cout << "响应内容: " << j.dump(2) << endl;
        }
    } else {
        cout << "请求失败: " << httplib::to_string(res.error()) << endl;
    }
    cout << "------------------------" << endl;
}

int main() {
    httplib::Client cli("http://localhost:8080");

    cout << "测试 REST API..." << endl;

    // 1. 获取所有用户
    cout << "\n1. 获取所有用户:" << endl;
    auto res1 = cli.Get("/users");
    print_response(res1);

    // 2. 创建新用户
    cout << "\n2. 创建新用户:" << endl;
    json new_user = {
        {"name", "王五"},
        {"email", "wangwu@example.com"}
    };
    auto res2 = cli.Post("/users", new_user.dump(), "application/json");
    print_response(res2);

    // 3. 获取单个用户
    cout << "\n3. 获取用户 ID=1:" << endl;
    auto res3 = cli.Get("/users/1");
    print_response(res3);

    // 4. 更新用户
    cout << "\n4. 更新用户 ID=1:" << endl;
    json update_user = {
        {"name", "张三（已更新）"},
        {"email", "zhangsan_new@example.com"}
    };
    auto res4 = cli.Put("/users/1", update_user.dump(), "application/json");
    print_response(res4);

    // 5. 删除用户
    cout << "\n5. 删除用户 ID=2:" << endl;
    auto res5 = cli.Delete("/users/2");
    print_response(res5);

    // 6. 验证删除后的用户列表
    cout << "\n6. 再次获取所有用户:" << endl;
    auto res6 = cli.Get("/users");
    print_response(res6);

    return 0;
} 