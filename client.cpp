#include <httplib.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include <thread>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

// TCP Socket客户端
class TcpClient {
public:
    TcpClient(const string& host, int port) : host_(host), port_(port) {
        // 初始化WinSock
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            throw runtime_error("WSAStartup failed");
        }

        // 创建socket
        sock_ = socket(AF_INET, SOCK_STREAM, 0);
        if (sock_ == INVALID_SOCKET) {
            WSACleanup();
            throw runtime_error("Socket creation failed");
        }

        // 设置服务器地址
        sockaddr_in serverAddr;
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        inet_pton(AF_INET, host.c_str(), &serverAddr.sin_addr);

        // 连接服务器
        if (connect(sock_, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
            closesocket(sock_);
            WSACleanup();
            throw runtime_error("Connection failed");
        }
    }

    ~TcpClient() {
        closesocket(sock_);
        WSACleanup();
    }

    // 发送消息
    bool sendMessage(const string& message) {
        if (send(sock_, message.c_str(), message.length(), 0) == SOCKET_ERROR) {
            return false;
        }
        return true;
    }

    // 接收消息
    string receiveMessage() {
        char buffer[4096];
        int bytesReceived = recv(sock_, buffer, sizeof(buffer) - 1, 0);
        if (bytesReceived <= 0) {
            return "";
        }
        buffer[bytesReceived] = '\0';
        return string(buffer);
    }

private:
    SOCKET sock_;
    string host_;
    int port_;
};

int main() {
    try {
        // 创建TCP客户端
        TcpClient tcpClient("127.0.0.1", 8080);
        cout << "已连接到TCP服务器" << endl;

        // 发送普通文本消息
        string textMessage = "Hello from C++ Client!";
        if (tcpClient.sendMessage(textMessage)) {
            cout << "发送文本消息: " << textMessage << endl;
            cout << "服务器响应: " << tcpClient.receiveMessage() << endl;
        }

        // 发送JSON消息
        string jsonMessage = R"({"type": "data", "content": "测试JSON消息"})";
        if (tcpClient.sendMessage(jsonMessage)) {
            cout << "发送JSON消息: " << jsonMessage << endl;
            cout << "服务器响应: " << tcpClient.receiveMessage() << endl;
        }

        // 使用HTTP客户端
        httplib::Client httpClient("http://localhost:3000");

        // 发送GET请求
        auto getRes = httpClient.Get("/api/data");
        if (getRes && getRes->status == 200) {
            cout << "\nHTTP GET响应: " << getRes->body << endl;
        }

        // 发送POST请求
        httplib::Headers headers = {
            {"Content-Type", "application/json"}
        };
        auto postRes = httpClient.Post("/api/message", 
            headers,
            R"({"message": "来自C++的HTTP POST请求"})",
            "application/json");

        if (postRes && postRes->status == 200) {
            cout << "HTTP POST响应: " << postRes->body << endl;
        }

    } catch (const exception& e) {
        cerr << "错误: " << e.what() << endl;
        return 1;
    }

    return 0;
} 