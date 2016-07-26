# aws-lambda-ec2-start-stop

## 前準備

Lambda用のロールにアタッチするポリシーの例

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt0000000000001",
            "Effect": "Allow",
            "Action": [
                "ec2:describe*",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

## 設定

```
$ npm run buld
```

上記コマンドで作成した、ec2-start-stop.zip をLambdaのfunctionにアップロード


## 参照

[OpsWorksかLambda(スケジュール）を使ってEC2自動起動自動停止で費用節約する)](http://qiita.com/toshihirock/items/83c15c35562bed170fe4)
