import 'package:shared_preferences/shared_preferences.dart';

class SessionManager {
  static const String _token = 'access_token';

  Future<void> saveSession(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_token, token);
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_token);
  }

  Future<void> removeSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_token);
  }
}