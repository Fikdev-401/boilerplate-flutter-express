import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:feruangayah/models/requests/login_request_model.dart';
import 'package:feruangayah/models/responses/login_response_model.dart';
import 'package:feruangayah/services/api_service.dart';

class LoginRepository {
  final ApiService _apiService = ApiService();

  Future<Either<String, LoginResponseModel>> login(LoginRequestModel request) async {
    try {
      final result = await _apiService.login(request);
      return Right(result);
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      if (statusCode == 401 || statusCode == 422) {
        return const Left('Email atau password salah');
      }

      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        final message = data['message'];
        if (message is String && message.isNotEmpty) {
          return Left(message);
        }
      }

      return Left('Login gagal. Coba lagi.');
    } catch (_) {
      return const Left('Login gagal. Coba lagi.');
    }
  }
}
