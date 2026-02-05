// Bootstrap PHP form template – pasted code is inserted at <!-- INSERT FORM CODE HERE -->

export const BOOTSTRAP_FORM_PLACEHOLDER = '<!-- INSERT FORM CODE HERE -->'
export const FORM_NAME_PLACEHOLDER = '<!--FORM_NAME-->'
export const POST_NAME_KEY_PLACEHOLDER = '<!--POST_NAME_KEY-->'
export const POST_NAME_EMPTY_CHECK_PLACEHOLDER = '<!--POST_NAME_EMPTY_CHECK-->'
export const POST_NAME_BUILD_PLACEHOLDER = '<!--POST_NAME_BUILD-->'
export const DOCU_ELSEIF_BLOCKS_PLACEHOLDER = '<!-- DOCU_ELSEIF_BLOCKS -->'

export const bootstrapTemplate = `<?php
defined('ACCESSIBLE') or exit('No direct script access allowed');
@session_start();



$formname = '<!--FORM_NAME-->';
/* $prompt_message = '<span class="required-info">* Required Information</span>'; */

if ($_POST) {

    $result_recaptcha = Main::recaptcha($recaptcha_privite, $_POST);

    if (
        <!--POST_NAME_EMPTY_CHECK-->
    ) {


        $asterisk = '<span style="color:#FF0000; font-weight:bold;">*&nbsp;</span>';
        $prompt_message = '<div id="error-msg"><div class="message"><span>Failed to send email. Please try again.</span><br/><p class="error-close">x</p></div></div>';
    } else if (!preg_match("/^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/i", stripslashes(trim($_POST['Email_Address'])))) {
        $prompt_message = '<div id="recaptcha-error"><div class="message"><span>Please enter a valid email address</span><br/><p class="rclose">x</p></div></div>';
    } else if (!$result_recaptcha->success) {
        $prompt_message = '<div id="recaptcha-error"><div class="message"><span>Invalid Recaptcha</span><p class="rclose">x</p></div></div>';
    } else {


        if (MAIL_TYPE == 1) {
            $formdisclaimer = '<div style="position: relative; top: 10px; background: #eef5f8; padding: 15px 20px; border-radius: 5px; width: 660px; margin: 0 auto; text-align: center; font-family: Poppins,sans-serif; border: 1px solid #f9f9f9;  color: #6a6a6a !important;">  
					<span style="border-radius: 50%; height: 19px; display: inline-block; color: #f49d2c; font-size: 15px;   text-align: center;"></span> Please do not reply to this email. This is only a notification from your website online forms. 
					<br>To contact the person who filled out your online form, kindly use the email which is inside the form below.</div>';
        } else
            $formdisclaimer = '';



        $body = '<div class="form_table" style="width:700px; height:auto; font-size:12px; color:#6a6a6a; letter-spacing:1px; margin: 0 auto; font-family: Poppins,sans-serif;">' . $formdisclaimer . '
		<div class="container" style="background: #fff; margin-top: 30px; font-family: Poppins,sans-serif; color:#6a6a6a; box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11); -webkit-box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11); -moz-box-shadow: 10px 10px 31px -7px rgba(38,38,38,0.11);  border-radius: 5px 5px 5px 5px; border: 1px solid #eee;">
			<div class="header" style="background: #a3c7d6; padding: 30px; border-radius: 5px 5px 0px 0px; ">
				<div align="left" style="font-size:22px; font-family: Poppins,sans-serif; color:#fff; font-weight: 900;">' . $formname . '</div>
				<div align="left" style=" color: #11465E;  font-size:19px; font-family: Poppins,sans-serif;  font-style: italic; margin-top: 6px; font-weight: 900;">' . COMP_NAME . '</div>
			</div>
		<div style="padding: 13px 30px 25px 30px;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="font-family: Poppins,sans-serif;font-size:14px; padding-bottom: 20px;"> 

					';
        foreach ($_POST as $key => $value) {
            if ($key == 'secode')
                continue;
            elseif ($key == 'submit')
                continue;
            elseif ($key == 'g-recaptcha-response')
                continue;
            elseif($key == 'checkboxVal') continue;

            if (!empty($value)) {
                $key2 = str_replace('_', ' ', $key);
                if ($value == ':') {
                    $body .= ' <tr margin-bottom="10px"> <td colspan="5" height="28" class="OFDPHeading" width="100%" style=" background:#F0F0F0; margin-bottom:5px;"><b style="padding-left: 4px;">' . $key2 . '</b></td></tr>';
                }else if ($key == "Privacy_Policy") {
						$body .= '<tr><td colspan="3" style="line-height:30px">
						<style>span.light-grey {color: #949191 !important;}</style>
				<span class="light-grey">Evidence of Consent:<br/>
                        [Checkbox Checked] I consent to the collection, use, storage, and processing of my personal and, where applicable, health-related information, including any data I submit on behalf of others, for the purpose of evaluating or fulfilling my request made through this form. I understand this will be handled in accordance with the Privacy Notice.<br><br>
						
						Form Version: V5.0-091025</span>
					</td></tr>';
                }
                <!-- DOCU_ELSEIF_BLOCKS -->
                } else {
                    $body .= '<tr><td class="Values1"colspan="2" height="28" align="left" width="40%" padding="100" style="line-height: normal; padding-left: 4px;text-justify: inter-word; word-wrap: anywhere; padding-right: 28px;">
								<span style="position:relative !important;"><b>' . $key2 . '</b></span >:</td> <td class="Values2"colspan="2" height="28" align="left" width="50%" padding="10" style="line-height: normal; word-wrap: anywhere; "><span style="margin-top: 7px; position:relative;margin-left: 7px; border-collapse: collapse; display: inline-block;margin-bottom: 5px;margin-right: 7px;">' . htmlspecialchars(trim($value), ENT_QUOTES) . '</span> </td></tr>';
                }
            }
        }
        $body .= '
					</table>
					</div>
					</div>';

        // save data form on database
        $subject = $formname;
        $attachments = array();

        //name of sender
        <!--POST_NAME_BUILD-->
        $result = insertDB($name, $subject, $body, $attachments);

        $parameter = array(
            'body' => $body,
            'from' => $from_email,
            'from_name' => $from_name,
            'to' => $to_email,
            'subject' => 'New Message Notification',
            'attachment' => $attachments
        );

        $prompt_message = send_email($parameter);
        unset($_POST);
    }
}
/*************declaration starts here************/
$state = array('Please select state.', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District Of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming');
$best_time_to_call = array('- Please select -', 'Anytime', 'Morning at Home', 'Morning at Work', 'Afternoon at Home', 'Afternoon at Work', 'Evening at Home', 'Evening at Work')
?>

<!DOCTYPE html>
<html lang="en">
<?php
include 'config/includes/head.php';
?>

<body>

    <div class="container my-5">
        <form id="submitform" name="contact" method="post" enctype="multipart/form-data" action="" novalidate
            class="needs-validation">

            <?php if ($testform): ?>
                <div class="alert alert-warning d-flex align-items-center p-3 mb-4" role="alert"
                    style="border-radius: 8px; font-size: 1.2rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="text-warning"
                        viewBox="0 0 24 24">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                    <strong>You are in test mode!</strong>
                </div>

            <?php endif; ?>

            <?php echo $prompt_message; ?>

            <!-- INSERT FORM CODE HERE -->



            <!-- Privacy Policy -->
            <div class="form-check mb-3 mt-3">
                <input type="checkbox" class="form-check-input" id="Privacy_Policy" name="Privacy_Policy" required>
                <label class="form-check-label" for="Privacy_Policy">I consent to the collection, use, storage, and processing of my personal and, where applicable, health-related information, including any data I submit on behalf of others, for the purpose of evaluating or fulfilling my request made through this form. I understand this will be handled in accordance with the <a href="/privacy-notice" target="_blank">Privacy Notice</a>.</label>
                <div class="invalid-feedback"></div>
            </div>

            <!-- Recaptcha and Submit Button -->
            <div class="row g-3 mb-3">
                <div class="col-md-12">
                    <div class="form-group">
                        <div class="g-recaptcha" data-sitekey="<?php echo $recaptcha_sitekey; ?>"></div>
                        <small class="form-text text-danger" id="recaptchaError" style="display: none;">Please complete
                            the
                            reCAPTCHA.</small>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 mt-3 p-10" id="submissionbutton"><span>Submit <i
                        class="fas fa-angle-double-right"></i></span></button>
        </form>
    </div>
    <?php $input->phone(true); ?>
    <!-- Google Recaptcha Script -->
    <script src="https://www.google.com/recaptcha/api.js"></script>

    <!-- Bootstrap 5 JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Clockpicker JS (Alternative CDN) -->
    <script src="https://cdn.jsdelivr.net/npm/clockpicker@0.0.7/dist/bootstrap-clockpicker.min.js"></script>

    <script type="text/javascript" src="../assets/js/jquery.datepick.min.js"></script>
    <script src="../assets/js/datepicker.js"></script>
    <script src="../assets/js/plugins.js"></script>
    <script src="../assets/js/jquery.mask.min.js"></script>
    <script src="../assets/js/proweaverPhone.js"></script>


    <!-- Clockpicker Initialization Script -->
    <script>
        $(document).ready(function() {

        <!-- INSERT HIDE/SHOW FUNCTIONALITY HERE -->

        });
    </script>


</body>

</html>
`