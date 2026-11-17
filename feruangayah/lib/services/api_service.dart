import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:feruangayah/models/requests/login_request_model.dart';
import 'package:feruangayah/models/requests/register_request_model.dart';
import 'package:feruangayah/models/responses/login_response_model.dart';
import 'package:feruangayah/models/responses/register_response_model.dart';

class ApiService {
  final Dio _dio = Dio();
  final String _baseUrl = 'http://127.0.0.1:3001/api';

  Future<LoginResponseModel> login(LoginRequestModel request) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/auth/login',
        data: request.toJson(),
      );
      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw FormatException('Format response login tidak valid: ${data.runtimeType}');
      }
      return LoginResponseModel.fromJson(data);
    } catch (e) {
      developer.log('Login failed: $e', name: 'ApiService.login');
      rethrow;
    }
  }

  Future<RegisterResponseModel> register(RegisterRequestModel request) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/auth/register',
        data: request.toJson(),
      );
      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw FormatException('Format response register tidak valid: ${data.runtimeType}');
      }
      return RegisterResponseModel.fromJson(data);
    } catch (e) {
      developer.log('Register failed: $e', name: 'ApiService.register');
      rethrow;
    }
  }

}
