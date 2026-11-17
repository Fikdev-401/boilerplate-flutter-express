class RegisterResponseModel {
  final String token;

  RegisterResponseModel({
    required this.token,
  });

  factory RegisterResponseModel.fromJson(Map<String, dynamic> json) {
    final token = _readToken(json);

    if (token == null || token.isEmpty) {
      throw const FormatException(
        'Token tidak ditemukan pada response register.',
      );
    }

    return RegisterResponseModel(token: token);
  }

  static String? _readToken(Map<String, dynamic> json) {
    final directAccessToken = json['access_token'];
    if (directAccessToken is String && directAccessToken.isNotEmpty) {
      return directAccessToken;
    }

    final directToken = json['token'];
    if (directToken is String && directToken.isNotEmpty) {
      return directToken;
    }

    final data = json['data'];
    if (data is Map<String, dynamic>) {
      final dataAccessToken = data['access_token'];
      if (dataAccessToken is String && dataAccessToken.isNotEmpty) {
        return dataAccessToken;
      }

      final dataToken = data['token'];
      if (dataToken is String && dataToken.isNotEmpty) {
        return dataToken;
      }
    }

    return null;
  }
}
