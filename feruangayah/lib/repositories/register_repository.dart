import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:feruangayah/models/requests/register_request_model.dart';
import 'package:feruangayah/models/responses/register_response_model.dart';
import 'package:feruangayah/services/api_service.dart';

class RegisterRepository {
  final ApiService _apiService = ApiService();

  Future<Either<String, RegisterResponseModel>> register(RegisterRequestModel request) async {
    try {
      final result = await _apiService.register(request);
      return Right(result);
    } on DioException catch (e) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        final message = data['message'];
        if (message is String && message.isNotEmpty) {
          return Left(message);
        }
        final errors = data['errors'];
        if (errors is Map<String, dynamic>) {
          for (final value in errors.values) {
            if (value is List && value.isNotEmpty && value.first is String) {
              return Left(value.first as String);
            }
          }
        }
      }
      return Left("Register failed: ${e.message}");
    } catch (e) {
      return Left("Register failed: $e");
    }
  }


}
