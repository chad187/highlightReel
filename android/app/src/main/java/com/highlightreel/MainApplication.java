package com.highlightreel;

import android.app.Application;

import com.corbt.keepawake.KCKeepAwakePackage;
import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactApplication;
import com.ninty.system.setting.SystemSettingPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.fileopener.FileOpenerPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.reactlibrary.RNVideoEditorPackage;
import com.rnfs.RNFSPackage;
import com.shahenlibrary.RNVideoProcessingPackage;

import java.util.Arrays;
import java.util.List;

import io.fabric.sdk.android.Fabric;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new SystemSettingPackage(),
            new FileOpenerPackage(),
            new KCKeepAwakePackage(),
            new OrientationPackage(),
            new RNFSPackage(),
            new RNVideoProcessingPackage(),
            new RNVideoEditorPackage(),
            new RCTCameraPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
  }
}
