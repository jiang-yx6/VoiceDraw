#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/asio.hpp>
#include <iostream>
#include <string>
#include <memory>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using tcp = net::ip::tcp;

class http_connection : public std::enable_shared_from_this<http_connection> {
public:
    http_connection(tcp::socket socket)
        : socket_(std::move(socket)) {
    }

    void start() {
        read_request();
    }

private:
    tcp::socket socket_;
    beast::flat_buffer buffer_;
    http::request<http::string_body> request_;
    http::response<http::string_body> response_;

    void read_request() {
        auto self = shared_from_this();

        http::async_read(
            socket_,
            buffer_,
            request_,
            [self](beast::error_code ec, std::size_t bytes) {
                if (!ec)
                    self->process_request();
            });
    }

    void process_request() {
        response_.version(request_.version());
        response_.keep_alive(false);

        switch (request_.method()) {
            case http::verb::get:
                response_.result(http::status::ok);
                response_.set(http::field::content_type, "text/plain");
                response_.body() = "Hello, World!\n";
                break;

            default:
                response_.result(http::status::bad_request);
                response_.set(http::field::content_type, "text/plain");
                response_.body() = "Invalid request-method\n";
                break;
        }

        response_.prepare_payload();
        write_response();
    }

    void write_response() {
        auto self = shared_from_this();

        http::async_write(
            socket_,
            response_,
            [self](beast::error_code ec, std::size_t) {
                self->socket_.shutdown(tcp::socket::shutdown_send, ec);
            });
    }
};

class http_server {
    net::io_context& ioc_;
    tcp::acceptor acceptor_;

public:
    http_server(net::io_context& ioc, tcp::endpoint endpoint)
        : ioc_(ioc)
        , acceptor_(ioc) {
        beast::error_code ec;

        acceptor_.open(endpoint.protocol(), ec);
        if (ec) {
            std::cerr << "open: " << ec.message() << std::endl;
            return;
        }

        acceptor_.set_option(net::socket_base::reuse_address(true), ec);
        if (ec) {
            std::cerr << "set_option: " << ec.message() << std::endl;
            return;
        }

        acceptor_.bind(endpoint, ec);
        if (ec) {
            std::cerr << "bind: " << ec.message() << std::endl;
            return;
        }

        acceptor_.listen(net::socket_base::max_listen_connections, ec);
        if (ec) {
            std::cerr << "listen: " << ec.message() << std::endl;
            return;
        }
    }

    void run() {
        accept();
    }

private:
    void accept() {
        acceptor_.async_accept(
            ioc_,
            beast::bind_front_handler(
                &http_server::on_accept,
                shared_from_this()));
    }

    void on_accept(beast::error_code ec, tcp::socket socket) {
        if (!ec)
            std::make_shared<http_connection>(std::move(socket))->start();
        accept();
    }
};

int main() {
    try {
        auto const address = net::ip::make_address("0.0.0.0");
        auto const port = static_cast<unsigned short>(8080);

        net::io_context ioc{1};
        std::make_shared<http_server>(ioc, tcp::endpoint{address, port})->run();
        std::cout << "Server started on port 8080..." << std::endl;
        ioc.run();
    }
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
} 